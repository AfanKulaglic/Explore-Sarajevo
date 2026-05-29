import { NextRequest, NextResponse } from 'next/server'
import { fetchWeatherApi } from 'openmeteo'

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'
const FX_URL = 'https://api.frankfurter.app/latest'

function mapWeatherCodeToCondition(code: number) {
  if ([0, 1].includes(code)) return { key: 'sunny', label: 'Clear', icon: 'sun' }
  if ([2, 3].includes(code)) return { key: 'cloudy', label: 'Cloudy', icon: 'cloud' }
  if ([45, 48].includes(code)) return { key: 'foggy', label: 'Fog', icon: 'cloud-fog' }
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { key: 'rainy', label: 'Rain', icon: 'cloud-rain' }
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { key: 'snowy', label: 'Snow', icon: 'snowflake' }
  }
  if ([95, 96, 99].includes(code)) {
    return { key: 'storm', label: 'Storm', icon: 'cloud-lightning' }
  }
  return { key: 'unknown', label: 'Unknown', icon: 'cloud' }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const latitude = Number(searchParams.get('lat')) || 43.8563
  const longitude = Number(searchParams.get('lon')) || 18.4131
  const baseCurrency = (searchParams.get('base') || 'BAM').toUpperCase()
  const targetParam = searchParams.get('targets') || 'EUR,USD'
  const targets = targetParam
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean)

  try {
    const weatherResponses = await fetchWeatherApi(WEATHER_URL, {
      latitude,
      longitude,
      current: ['temperature_2m', 'weather_code'],
      hourly: ['temperature_2m', 'weather_code'],
      daily: ['temperature_2m_max', 'temperature_2m_min', 'weather_code'],
      forecast_hours: 12,
      timezone: 'auto'
    })

    const weatherResponse = weatherResponses?.[0]

    let weather
    if (weatherResponse) {
      const current = weatherResponse.current()
      const hourly = weatherResponse.hourly()
      const daily = weatherResponse.daily()
      const utcOffsetSeconds = weatherResponse.utcOffsetSeconds()

      const currentTemp = current?.variables(0)?.value() ?? null
      const currentCode = current?.variables(1)?.value() ?? null
      const high = daily?.variables(0)?.valuesArray()?.[0] ?? null
      const low = daily?.variables(1)?.valuesArray()?.[0] ?? null
      const conditionInfo = currentCode !== null ? mapWeatherCodeToCondition(currentCode) : undefined

      // Build hourly forecast (next 6 hours)
      const hourlyTemps = hourly?.variables(0)?.valuesArray()
      const hourlyCodes = hourly?.variables(1)?.valuesArray()
      const hourlyStartTime = Number(hourly?.time() ?? 0)
      const hourlyInterval = hourly?.interval() ?? 3600

      const hourlyForecast: Array<{
        time: string
        hour: number
        temp: number
        condition: string
        icon: string
      }> = []

      if (hourlyTemps && hourlyCodes) {
        const now = Math.floor(Date.now() / 1000)
        let startIndex = 0
        
        // Find the current hour index
        for (let i = 0; i < hourlyTemps.length; i++) {
          const hourTime = hourlyStartTime + i * hourlyInterval + utcOffsetSeconds
          if (hourTime >= now - 1800) {
            startIndex = i
            break
          }
        }

        // Get next 6 hours starting from current
        for (let i = startIndex; i < Math.min(startIndex + 6, hourlyTemps.length); i++) {
          const hourTime = hourlyStartTime + i * hourlyInterval + utcOffsetSeconds
          const date = new Date(hourTime * 1000)
          const code = hourlyCodes[i]
          const info = mapWeatherCodeToCondition(code)
          
          hourlyForecast.push({
            time: date.toISOString(),
            hour: date.getHours(),
            temp: Math.round(hourlyTemps[i]),
            condition: info.key,
            icon: info.icon
          })
        }
      }

      weather = {
        temperature: currentTemp,
        high,
        low,
        condition: conditionInfo?.key ?? 'unknown',
        description: conditionInfo?.label ?? 'Unknown',
        icon: conditionInfo?.icon ?? 'cloud',
        hourly: hourlyForecast,
        timezone: weatherResponse.timezone(),
        timezoneAbbreviation: weatherResponse.timezoneAbbreviation(),
        utcOffsetSeconds,
        updatedAt: new Date().toISOString()
      }
    }

    let rates: Record<string, number> | undefined
    if (targets.length) {
      const fxResponse = await fetch(
        `${FX_URL}?from=${baseCurrency}&to=${encodeURIComponent(targets.join(','))}`,
        { next: { revalidate: 3600 } }
      )

      if (fxResponse.ok) {
        const fxJson = await fxResponse.json()
        rates = fxJson.rates
      }
    }

    return NextResponse.json({
      success: true,
      weather,
      rates,
      baseCurrency,
      targets,
      fetchedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('[City Services API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch city services data' },
      { status: 500 }
    )
  }
}

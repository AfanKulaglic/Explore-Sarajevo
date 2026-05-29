'use client'

import { useLanguage } from '@/context/LanguageContext'
import { UtilitiesConfig } from '@/types/content'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { 
  Cloud, 
  Clock, 
  Coins, 
  Sun, 
  CloudRain, 
  Snowflake, 
  CloudLightning,
  CloudFog,
  TrendingUp, 
  TrendingDown,
  Sunrise,
  Sunset,
  Moon,
  RefreshCw,
  ArrowUpDown
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect, useCallback, type RefObject } from 'react'
import { ANALYTICS_EVENTS } from '@/lib/analytics/events'
import { captureEvent } from '@/lib/analytics/capture'
import { useImpressionOnce } from '@/lib/analytics/use-impression-once'

interface CityUtilityProps {
  config?: UtilitiesConfig
}

interface HourlyForecast {
  time: string
  hour: number
  temp: number
  condition: string
  icon: string
}

interface WeatherPayload {
  temperature: number | null
  high: number | null
  low: number | null
  condition: string
  description: string
  icon: string
  hourly: HourlyForecast[]
}

// Map condition to Lucide icon component
function getWeatherIcon(condition: string) {
  switch (condition) {
    case 'sunny':
      return Sun
    case 'rainy':
      return CloudRain
    case 'snowy':
      return Snowflake
    case 'storm':
      return CloudLightning
    case 'foggy':
      return CloudFog
    case 'cloudy':
    default:
      return Cloud
  }
}

// Get icon color based on condition
function getIconColor(condition: string) {
  switch (condition) {
    case 'sunny':
      return 'text-yellow-400'
    case 'rainy':
      return 'text-blue-400'
    case 'snowy':
      return 'text-cyan-300'
    case 'storm':
      return 'text-purple-400'
    case 'foggy':
      return 'text-gray-400'
    case 'cloudy':
    default:
      return 'text-gray-300'
  }
}

// Get time of day info based on hour
function getTimeOfDay(hour: number): { 
  period: string
  periodBs: string
  icon: typeof Sun
  gradient: string
  bgColor: string
} {
  if (hour >= 5 && hour < 7) {
    return { 
      period: 'Dawn', 
      periodBs: 'Zora',
      icon: Sunrise, 
      gradient: 'from-orange-500/30 via-pink-500/20 to-purple-600/30',
      bgColor: 'bg-orange-500/20'
    }
  } else if (hour >= 7 && hour < 12) {
    return { 
      period: 'Morning', 
      periodBs: 'Jutro',
      icon: Sun, 
      gradient: 'from-yellow-400/30 via-orange-400/20 to-amber-500/30',
      bgColor: 'bg-yellow-500/20'
    }
  } else if (hour >= 12 && hour < 17) {
    return { 
      period: 'Afternoon', 
      periodBs: 'Popodne',
      icon: Sun, 
      gradient: 'from-blue-400/30 via-cyan-400/20 to-sky-500/30',
      bgColor: 'bg-blue-400/20'
    }
  } else if (hour >= 17 && hour < 20) {
    return { 
      period: 'Evening', 
      periodBs: 'Večer',
      icon: Sunset, 
      gradient: 'from-orange-600/30 via-red-500/20 to-purple-700/30',
      bgColor: 'bg-orange-600/20'
    }
  } else if (hour >= 20 && hour < 23) {
    return { 
      period: 'Dusk', 
      periodBs: 'Suton',
      icon: Moon, 
      gradient: 'from-purple-600/30 via-indigo-600/20 to-blue-800/30',
      bgColor: 'bg-purple-600/20'
    }
  } else {
    return { 
      period: 'Night', 
      periodBs: 'Noć',
      icon: Moon, 
      gradient: 'from-slate-800/50 via-indigo-900/30 to-slate-900/50',
      bgColor: 'bg-indigo-900/30'
    }
  }
}

// Format date based on language
function formatDate(date: Date, isBosnian: boolean): string {
  if (isBosnian) {
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return `${day}.${month}.${year}.`
  } else {
    const day = date.getDate()
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    const suffix = getOrdinalSuffix(day)
    return `${day}${suffix} of ${month} ${year}`
  }
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

function getDayName(date: Date, isBosnian: boolean): string {
  const days = isBosnian 
    ? ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[date.getDay()]
}

/**
 * CityUtility Component
 * 
 * Displays city services: weather with hourly forecast, local time, and currency exchange.
 * Features live time updates and clean card-based layout.
 */
export function CityUtility({ config }: CityUtilityProps) {
  const { t, language } = useLanguage()
  const isBosnian = language === 'BA'
  const baseCurrency = (config?.baseCurrency || 'BAM').toUpperCase()
  const latitude = config?.lat
  const longitude = config?.lon
  const [currentTime, setCurrentTime] = useState<string>('')
  const [currentHour, setCurrentHour] = useState<number>(12)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [isClient, setIsClient] = useState(false)
  const [weatherData, setWeatherData] = useState<WeatherPayload | null>(null)
  const [rates, setRates] = useState<Record<string, number>>({})
  const [isLoadingServices, setIsLoadingServices] = useState(false)
  const [servicesError, setServicesError] = useState<string | null>(null)
  
  // Currency converter state - initialize with calculated BAM value (100 EUR * 1.95583)
  const [selectedCurrency, setSelectedCurrency] = useState<'EUR' | 'USD'>('EUR')
  const [topAmount, setTopAmount] = useState<string>('100')
  const [bottomAmount, setBottomAmount] = useState<string>('195.58')
  const [lastEdited, setLastEdited] = useState<'top' | 'bottom'>('top')

  const cityLabel = config?.city ?? 'unknown'

  const sectionRef = useImpressionOnce(
    useCallback(() => {
      captureEvent(ANALYTICS_EVENTS.city_services_section_viewed, {
        placement_type: 'city_services',
        city: cityLabel,
      })
    }, [cityLabel]),
    { threshold: 0.2 }
  )

  const weatherWidgetRef = useImpressionOnce(
    useCallback(() => {
      captureEvent(ANALYTICS_EVENTS.city_services_widget_viewed, {
        widget: 'weather',
        city: cityLabel,
      })
    }, [cityLabel]),
    { threshold: 0.3, resetKey: 'weather' }
  )

  const timeWidgetRef = useImpressionOnce(
    useCallback(() => {
      captureEvent(ANALYTICS_EVENTS.city_services_widget_viewed, {
        widget: 'time',
        city: cityLabel,
      })
    }, [cityLabel]),
    { threshold: 0.3, resetKey: 'time' }
  )

  const currencyWidgetRef = useImpressionOnce(
    useCallback(() => {
      captureEvent(ANALYTICS_EVENTS.city_services_widget_viewed, {
        widget: 'currency',
        city: cityLabel,
      })
    }, [cityLabel]),
    { threshold: 0.3, resetKey: 'currency' }
  )

  // Update time every second on client
  useEffect(() => {
    setIsClient(true)
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
      }))
      setCurrentHour(now.getHours())
      setCurrentDate(now)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Fetch live weather + FX data
  useEffect(() => {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return

    const controller = new AbortController()
    const fetchData = async () => {
      setIsLoadingServices(true)
      setServicesError(null)
      try {
        const params = new URLSearchParams({
          lat: String(latitude),
          lon: String(longitude),
          base: 'EUR', // Always fetch EUR as base for converter
          targets: 'USD,BAM' // We need these for the converter
        })

        const response = await fetch(`/api/city-services?${params.toString()}`, {
          signal: controller.signal
        })

        if (!response.ok) {
          throw new Error('Failed to fetch city services')
        }

        const data = await response.json()

        if (!controller.signal.aborted) {
          setWeatherData(data.weather ?? null)
          // Store rates with EUR as base
          setRates(data.rates ?? {})
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('[CityUtility] Fetch error:', error)
          setServicesError(t('Podaci nisu dostupni', 'Data temporarily unavailable'))
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingServices(false)
        }
      }
    }

    fetchData()

    return () => {
      controller.abort()
    }
  }, [latitude, longitude, t])

  // Currency conversion logic - use fallback rates if API rates not yet loaded
  const convertCurrency = useCallback((amount: number, from: string, to: string): number => {
    // Use fallback rates (BAM is fixed to EUR, USD varies)
    const eurToBAM = rates.BAM || 1.95583 // BAM is pegged to EUR
    const eurToUSD = rates.USD || 1.05
    
    if (from === 'EUR' && to === 'BAM') return amount * eurToBAM
    if (from === 'EUR' && to === 'USD') return amount * eurToUSD
    if (from === 'USD' && to === 'BAM') return (amount / eurToUSD) * eurToBAM
    if (from === 'USD' && to === 'EUR') return amount / eurToUSD
    if (from === 'BAM' && to === 'EUR') return amount / eurToBAM
    if (from === 'BAM' && to === 'USD') return (amount / eurToBAM) * eurToUSD
    
    return amount
  }, [rates])

  // Update conversions when values change - calculate immediately with fallback rates
  useEffect(() => {
    if (lastEdited === 'top' && topAmount) {
      const numAmount = parseFloat(topAmount) || 0
      const converted = convertCurrency(numAmount, selectedCurrency, 'BAM')
      setBottomAmount(converted.toFixed(2))
    } else if (lastEdited === 'bottom' && bottomAmount) {
      const numAmount = parseFloat(bottomAmount) || 0
      const converted = convertCurrency(numAmount, 'BAM', selectedCurrency)
      setTopAmount(converted.toFixed(2))
    }
  }, [topAmount, bottomAmount, selectedCurrency, lastEdited, convertCurrency])

  const handleTopChange = (value: string) => {
    setTopAmount(value)
    setLastEdited('top')
  }

  const handleBottomChange = (value: string) => {
    setBottomAmount(value)
    setLastEdited('bottom')
  }

  const toggleSelectedCurrency = () => {
    setSelectedCurrency(prev => prev === 'EUR' ? 'USD' : 'EUR')
    setLastEdited('top')

    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  if (!config) return null

  const formatTemp = (value: number | null | undefined) =>
    typeof value === 'number' ? Math.round(value) : '—'

  const weatherCondition = weatherData?.condition ?? 'unknown'
  const WeatherIcon = getWeatherIcon(weatherCondition)
  const iconColor = getIconColor(weatherCondition)
  const timeOfDay = getTimeOfDay(currentHour)
  const TimeIcon = timeOfDay.icon

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <section ref={sectionRef as RefObject<HTMLElement>} className="py-10 sm:py-12 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t('Saraya Connect Servisi', 'Saraya Connect Services')}
          title={t('Gradski Servisi', 'City Services')}
          subtitle={t(
            'Korisne informacije dok ste povezani',
            'Useful info while you\'re connected'
          )}
          icon="CloudSun"
        />

        {/* Mobile Time Display - shown only on mobile above the cards */}
        <motion.div 
          className="sm:hidden mb-6"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className={`relative rounded-2xl p-5 overflow-hidden bg-gradient-to-br ${timeOfDay.gradient}`}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white/60" />
                  <span className="text-xs text-white/60 uppercase tracking-wider font-medium">
                    {config.city}
                  </span>
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${timeOfDay.bgColor} border border-white/10`}>
                  <TimeIcon className="w-3 h-3 text-white/80" />
                  <span className="text-[10px] font-medium text-white/80">
                    {isBosnian ? timeOfDay.periodBs : timeOfDay.period}
                  </span>
                </div>
              </div>
              <div className="text-4xl font-bold text-white font-mono tracking-tight">
                {isClient ? currentTime : '--:--:--'}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-white/70">
                  {isClient ? getDayName(currentDate, isBosnian) : ''}
                </span>
                <span className="text-xs text-white/40">
                  {isClient ? formatDate(currentDate, isBosnian) : ''}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Weather Card - Compact on mobile, full on desktop */}
          <motion.div
            ref={weatherWidgetRef as RefObject<HTMLDivElement>}
            variants={itemVariants}
            className="col-span-1 sm:col-span-2 lg:col-span-1"
          >
            <Card variant="glass" className="p-3 sm:p-6 h-full">
              {/* Header - Compact on mobile */}
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 flex items-center justify-center border border-primary-500/20">
                  <Cloud className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
                </div>
                <div>
                  <div className="text-[9px] sm:text-xs text-white/40 uppercase tracking-wider font-medium">
                    {t('Vrijeme', 'Weather')}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-white">{config.city}</div>
                </div>
              </div>
              
              {/* Current Weather - Compact on mobile */}
              <div className="flex items-center justify-between mb-2 sm:mb-5">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="relative">
                    <WeatherIcon className={`w-10 h-10 sm:w-14 sm:h-14 ${iconColor} drop-shadow-lg`} />
                    {weatherCondition === 'sunny' && (
                      <div className="absolute inset-0 w-10 h-10 sm:w-14 sm:h-14 bg-yellow-400/20 rounded-full blur-xl -z-10" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-2xl sm:text-5xl font-bold text-white">
                        {formatTemp(weatherData?.temperature)}
                      </span>
                      <span className="text-lg sm:text-2xl text-white/50 ml-0.5 sm:ml-1">°C</span>
                    </div>
                    <div className="text-xs sm:text-sm text-white/60 capitalize mt-0.5 hidden sm:block">
                      {weatherData?.description || t('Učitavanje...', 'Loading...')}
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-0.5 sm:space-y-1">
                  <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-white/60">
                    <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400" />
                    <span>{formatTemp(weatherData?.high)}°</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-white/60">
                    <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
                    <span>{formatTemp(weatherData?.low)}°</span>
                  </div>
                </div>
              </div>

              {/* Weather description - mobile only, below temp */}
              <div className="text-[10px] text-white/60 capitalize mb-2 sm:hidden">
                {weatherData?.description || t('Učitavanje...', 'Loading...')}
              </div>

              {/* Hourly Forecast - hidden on mobile */}
              {weatherData?.hourly && weatherData.hourly.length > 0 && (
                <div className="hidden sm:block pt-4 border-t border-white/10">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-3">
                    {t('Po satu', 'Hourly')}
                  </div>
                  <div className="flex justify-between gap-1">
                    {weatherData.hourly.slice(0, 6).map((hour, index) => {
                      const HourIcon = getWeatherIcon(hour.condition)
                      const hourIconColor = getIconColor(hour.condition)
                      const isNow = index === 0
                      
                      return (
                        <div 
                          key={hour.time} 
                          className={`flex flex-col items-center py-2 px-1.5 rounded-lg flex-1 ${
                            isNow ? 'bg-primary-500/20 border border-primary-500/30' : 'bg-white/5'
                          }`}
                        >
                          <span className={`text-[10px] font-medium mb-1 ${
                            isNow ? 'text-primary-300' : 'text-white/50'
                          }`}>
                            {isNow ? t('Sad', 'Now') : `${hour.hour}h`}
                          </span>
                          <HourIcon className={`w-5 h-5 ${hourIconColor} mb-1`} />
                          <span className={`text-xs font-semibold ${
                            isNow ? 'text-white' : 'text-white/80'
                          }`}>
                            {hour.temp}°
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Loading state for hourly - hidden on mobile */}
              {isLoadingServices && !weatherData?.hourly && (
                <div className="hidden sm:block pt-4 border-t border-white/10">
                  <div className="flex justify-between gap-1">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex flex-col items-center py-2 px-1.5 rounded-lg flex-1 bg-white/5 animate-pulse">
                        <div className="w-6 h-2 bg-white/10 rounded mb-1" />
                        <div className="w-5 h-5 bg-white/10 rounded mb-1" />
                        <div className="w-4 h-3 bg-white/10 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {servicesError && (
                <p className="text-xs text-red-300 mt-3">{servicesError}</p>
              )}
            </Card>
          </motion.div>

          {/* Time Card - Hidden on mobile (shown above grid), visible on tablet/desktop */}
          <motion.div
            ref={timeWidgetRef as RefObject<HTMLDivElement>}
            variants={itemVariants}
            className="hidden sm:block"
          >
            <Card variant="glass" className="p-5 sm:p-6 h-full overflow-hidden relative">
              {/* Background gradient based on time of day */}
              <div className={`absolute inset-0 bg-gradient-to-br ${timeOfDay.gradient} opacity-50`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${timeOfDay.bgColor} flex items-center justify-center border border-white/10`}>
                      <Clock className="w-5 h-5 text-white/80" />
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider font-medium">
                        {t('Lokalno vrijeme', 'Local Time')}
                      </div>
                      <div className="text-sm font-semibold text-white">{config.city}</div>
                    </div>
                  </div>
                  {/* Time of day indicator */}
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${timeOfDay.bgColor} border border-white/10`}>
                    <TimeIcon className="w-3.5 h-3.5 text-white/80" />
                    <span className="text-[10px] font-medium text-white/80">
                      {isBosnian ? timeOfDay.periodBs : timeOfDay.period}
                    </span>
                  </div>
                </div>
                
                {/* Main time display */}
                <div className="text-4xl sm:text-5xl font-bold text-white font-mono tracking-tight mb-3">
                  {isClient ? currentTime : '--:--:--'}
                </div>
                
                {/* Day and date */}
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-white/70">
                    {isClient ? getDayName(currentDate, isBosnian) : ''}
                  </div>
                  <div className="text-xs text-white/50">
                    {isClient ? formatDate(currentDate, isBosnian) : ''}
                  </div>
                </div>

                {/* Sun Arc Visualization */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="relative h-20 overflow-hidden">
                    {/* Arc path */}
                    <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="xMidYMax meet">
                      {/* Gradient for the arc */}
                      <defs>
                        <linearGradient id="sunArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                          <stop offset="50%" stopColor="#facc15" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0.3" />
                        </linearGradient>
                        <linearGradient id="horizonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                          <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
                          <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                        </linearGradient>
                      </defs>
                      
                      {/* Arc background */}
                      <path
                        d="M 10 75 Q 100 -10 190 75"
                        fill="none"
                        stroke="url(#sunArcGradient)"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        opacity="0.5"
                      />
                      
                      {/* Horizon line */}
                      <line x1="10" y1="75" x2="190" y2="75" stroke="url(#horizonGradient)" strokeWidth="1" />
                      
                      {/* Sun position - calculated based on time between sunrise (7:00) and sunset (17:00) */}
                      {isClient && (() => {
                        const sunriseHour = 7
                        const sunsetHour = 17
                        const dayLength = sunsetHour - sunriseHour
                        const currentMinutes = currentHour + (currentDate.getMinutes() / 60)
                        
                        // Calculate sun position (0 to 1) during daylight hours
                        let sunProgress = 0
                        if (currentMinutes >= sunriseHour && currentMinutes <= sunsetHour) {
                          sunProgress = (currentMinutes - sunriseHour) / dayLength
                        } else if (currentMinutes > sunsetHour) {
                          sunProgress = 1
                        }
                        
                        // Arc path calculation (quadratic bezier)
                        const t = sunProgress
                        const x = (1-t)*(1-t)*10 + 2*(1-t)*t*100 + t*t*190
                        const y = (1-t)*(1-t)*75 + 2*(1-t)*t*(-10) + t*t*75
                        
                        const isDay = currentMinutes >= sunriseHour && currentMinutes <= sunsetHour
                        
                        return (
                          <g>
                            {/* Sun glow */}
                            <circle cx={x} cy={y} r="12" fill="rgba(250, 204, 21, 0.2)" />
                            <circle cx={x} cy={y} r="8" fill="rgba(250, 204, 21, 0.3)" />
                            {/* Sun */}
                            <circle 
                              cx={x} 
                              cy={y} 
                              r="5" 
                              fill={isDay ? "#facc15" : "#94a3b8"}
                              className={isDay ? "drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" : ""}
                            />
                          </g>
                        )
                      })()}
                    </svg>
                    
                    {/* Sunrise / Sunset labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end px-1">
                      <div className="flex items-center gap-1">
                        <Sunrise className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-[10px] text-white/50">07:00</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-white/50">17:00</span>
                        <Sunset className="w-3.5 h-3.5 text-orange-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Currency Converter Card - Compact on mobile */}
          <motion.div
            ref={currencyWidgetRef as RefObject<HTMLDivElement>}
            variants={itemVariants}
            className="col-span-1"
          >
            <Card variant="glass" className="p-3 sm:p-6 h-full">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 flex items-center justify-center border border-primary-500/20">
                    <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-xs text-white/40 uppercase tracking-wider font-medium">
                      {t('Konverter', 'Converter')}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-white">
                      {t('Kurs valuta', 'Exchange')}
                    </div>
                  </div>
                </div>
                {isLoadingServices && (
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 text-white/30 animate-spin" />
                )}
              </div>
              
              {/* Currency input - Top (EUR/USD) */}
              <div className="space-y-2 sm:space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={topAmount}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        handleTopChange(val)
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 pr-20 sm:pr-28 text-base sm:text-lg font-semibold text-white placeholder-white/30 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all"
                    placeholder="0.00"
                  />
                  {/* Currency segmented selector - click anywhere to toggle */}
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault()
                    }}
                    onClick={toggleSelectedCurrency}
                    className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 flex rounded-md sm:rounded-lg bg-white/5 border border-white/10 p-0.5 cursor-pointer hover:bg-white/10 transition-all"
                  >
                    <span
                      className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-bold transition-all ${
                        selectedCurrency === 'EUR'
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                          : 'text-white/50'
                      }`}
                    >
                      EUR
                    </span>
                    <span
                      className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-bold transition-all ${
                        selectedCurrency === 'USD'
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                          : 'text-white/50'
                      }`}
                    >
                      USD
                    </span>
                  </button>
                </div>

                {/* Swap indicator - hidden on mobile */}
                <div className="hidden sm:flex items-center justify-center">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <div className="mx-3 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <ArrowUpDown className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>

                {/* Mobile swap indicator - smaller */}
                <div className="flex sm:hidden items-center justify-center py-0.5">
                  <ArrowUpDown className="w-3 h-3 text-white/30" />
                </div>

                {/* Currency input - Bottom (BAM) */}
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={bottomAmount}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        handleBottomChange(val)
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 pr-14 sm:pr-20 text-base sm:text-lg font-semibold text-white placeholder-white/30 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all"
                    placeholder="0.00"
                  />
                  <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                    <span className="text-xs sm:text-sm font-bold text-white/60">BAM</span>
                  </div>
                </div>

                {/* Rate info - simplified on mobile */}
                <div className="flex items-center justify-between pt-1 sm:pt-2 text-[10px] sm:text-[11px] text-white/40">
                  <span className="hidden sm:inline">
                    1 {selectedCurrency} = {
                      selectedCurrency === 'EUR' 
                        ? (rates.BAM || 1.95583).toFixed(4)
                        : ((rates.BAM || 1.95583) / (rates.USD || 1.05)).toFixed(4)
                    } BAM
                  </span>
                  <span className="sm:hidden">
                    1 {selectedCurrency} = {
                      selectedCurrency === 'EUR' 
                        ? (rates.BAM || 1.95583).toFixed(2)
                        : ((rates.BAM || 1.95583) / (rates.USD || 1.05)).toFixed(2)
                    }
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {t('Uživo', 'Live')}
                  </span>
                </div>
              </div>

              {servicesError && (
                <div className="text-xs text-red-300 mt-3">
                  {servicesError}
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

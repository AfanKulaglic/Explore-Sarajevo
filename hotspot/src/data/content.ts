import { PortalContent } from '@/types/content'

// Static content data (will be replaced with Supabase later)
export const portalContent: PortalContent = {
  global: {
    backgroundColor: "rgba(10, 10, 15, 1)",
    primaryColor: "rgba(139, 92, 246, 1)",
    secondaryColor: "rgba(167, 139, 250, 1)"
  },
  heroVideos: [
    {
      id: "1",
      // Primary video URL
      videoFile: "/assets/video/hero.mp4",
      // Secondary/alternative video URL for random rotation
      videoFileAlt: "/assets/video/krpljanje.mp4",
      thumbnail: "/assets/video/hero-poster.jpg",
      titleBosnian: "POVEŽI SE I\nISTRAŽI PONUDE",
      titleEnglish: "CONNECT AND\nEXPLORE OFFERS",
      buttonTextBosnian: "POGLEDAJ",
      buttonTextEnglish: "VIEW",
      buttonLink: "#offers"
    }
  ],
  chips: [
    {
      id: "1",
      nameBosnian: "Istraži Sarajevo",
      nameEnglish: "Explore Sarajevo",
      link: "https://bihdiscovery.com",
      icon: "MapPin"
    },
    {
      id: "2",
      nameBosnian: "HotSpot Izbor",
      nameEnglish: "HotSpot Picks",
      link: "#picks",
      icon: "Sparkles"
    },
    {
      id: "3",
      nameBosnian: "Flappy Bird",
      nameEnglish: "Flappy Bird",
      link: "https://saraya.games/",
      icon: "Gamepad2"
    },
    {
      id: "4",
      nameBosnian: "Ponude",
      nameEnglish: "Deals",
      link: "#deals",
      icon: "Tag"
    },
    {
      id: "5",
      nameBosnian: "Restorani",
      nameEnglish: "Restaurants",
      link: "#food",
      icon: "Utensils"
    },
    {
      id: "6",
      nameBosnian: "Događaji",
      nameEnglish: "Events",
      link: "#events",
      icon: "Calendar"
    }
  ],
  heroBanners: [
    {
      id: "1",
      imageFile: "/assets/banners/carsija.jpg",
      titleBosnian: "Specijalna ponuda dana",
      titleEnglish: "Special offer of the day",
      subtitleBosnian: "Otkrijte najbolje ponude u gradu",
      subtitleEnglish: "Discover the best deals in town",
      buttonTextBosnian: "POGLEDAJ PONUDU",
      buttonTextEnglish: "VIEW OFFER",
      buttonLink: "#offers"
    }
  ],
  blockSets: [
    {
      id: "1",
      blocks: [
        {
          id: "1",
          imageFile: "/assets/blocks/coca_cola_toast.jpg",
          titleBosnian: "Coca-Cola",
          titleEnglish: "Coca-Cola",
          descriptionBosnian: "Taste the feeling",
          descriptionEnglish: "Taste the feeling",
          buttonTextBosnian: "POGLEDAJ",
          buttonTextEnglish: "VIEW",
          buttonLink: "https://www.coca-colacompany.com/"
        },
        {
          id: "2",
          imageFile: "/assets/blocks/pandorina_kutija.png",
          titleBosnian: "Pandora",
          titleEnglish: "Pandora",
          descriptionBosnian: "Dajemo glas ljubavi ljudi",
          descriptionEnglish: "We give voice to people's love",
          buttonTextBosnian: "POGLEDAJ",
          buttonTextEnglish: "VIEW",
          buttonLink: "#"
        },
        {
          id: "3",
          imageFile: "/assets/blocks/Bingo_City_Centar.jpg",
          titleBosnian: "Bingo",
          titleEnglish: "Bingo",
          descriptionBosnian: "Kralj dobrih cijena",
          descriptionEnglish: "King of good prices",
          buttonTextBosnian: "POGLEDAJ",
          buttonTextEnglish: "VIEW",
          buttonLink: "#"
        },
        {
          id: "4",
          imageFile: "/assets/blocks/carlsberg_toast.jpg",
          titleBosnian: "Carlsberg",
          titleEnglish: "Carlsberg",
          descriptionBosnian: "Carlsberg se obavezuje na kontinuirano unapređenje i postizanje sve boljeg kvaliteta piva",
          descriptionEnglish: "Carlsberg is committed to continuous improvement and achieving ever better beer quality",
          buttonTextBosnian: "POGLEDAJ",
          buttonTextEnglish: "VIEW",
          buttonLink: "#"
        },
        {
          id: "5",
          imageFile: "/assets/blocks/aria_mall.jpeg",
          titleBosnian: "ARIA",
          titleEnglish: "ARIA",
          descriptionBosnian: "Savršen poklon za svaku priliku!",
          descriptionEnglish: "Perfect gift for every occasion!",
          buttonTextBosnian: "POGLEDAJ",
          buttonTextEnglish: "VIEW",
          buttonLink: "#"
        },
        {
          id: "6",
          imageFile: "/assets/blocks/redbulldrink.jpg",
          titleBosnian: "Red Bull",
          titleEnglish: "Red Bull",
          descriptionBosnian: "Daje ti krila",
          descriptionEnglish: "Gives you wings",
          buttonTextBosnian: "POGLEDAJ",
          buttonTextEnglish: "VIEW",
          buttonLink: "#"
        }
      ],
      styling: {
        blockBackground: "rgba(26, 26, 36, 1)",
        titleColor: "rgba(255, 255, 255, 1)",
        descriptionColor: "rgba(156, 163, 175, 1)",
        buttonBackground: "rgba(139, 92, 246, 1)",
        buttonTextColor: "rgba(255, 255, 255, 1)"
      }
    }
  ],
  editorsPicks: [
    {
      id: "1",
      titleBosnian: "Baščaršija",
      titleEnglish: "Baščaršija",
      teaserBosnian: "Historijsko srce Sarajeva sa tradicionalnim zanatima i kafanama",
      teaserEnglish: "Historic heart of Sarajevo with traditional crafts and cafes",
      imageFile: "/assets/editors/carsija.jpg",
      link: "#"
    },
    {
      id: "2",
      titleBosnian: "Panorama Sarajeva",
      titleEnglish: "Sarajevo Panorama",
      teaserBosnian: "Prekrasan pogled na grad noću sa vidikovca",
      teaserEnglish: "Beautiful night view of the city from the viewpoint",
      imageFile: "/assets/editors/panoramaSarajevoNoc.jpg",
      link: "#"
    },
    {
      id: "3",
      titleBosnian: "Pandora Nakit",
      titleEnglish: "Pandora Jewelry",
      teaserBosnian: "Ekskluzivna kolekcija nakita - dajemo glas ljubavi",
      teaserEnglish: "Exclusive jewelry collection - giving voice to love",
      imageFile: "/assets/editors/pandorina_kutija.png",
      link: "#"
    }
  ],
  discovery: {
    places: [
      {
        id: "1",
        nameBosnian: "Bjelašnica",
        nameEnglish: "Bjelašnica",
        categoryBosnian: "Planina",
        categoryEnglish: "Mountain",
        imageFile: "/assets/discovery/visitBjelasnica.jpg",
        link: "#"
      },
      {
        id: "2",
        nameBosnian: "Sarajevo",
        nameEnglish: "Sarajevo",
        categoryBosnian: "Grad",
        categoryEnglish: "City",
        imageFile: "/assets/discovery/arrayDekoracija.png",
        link: "#"
      },
      {
        id: "3",
        nameBosnian: "Visit Bjelašnica",
        nameEnglish: "Visit Bjelašnica",
        categoryBosnian: "Turizam",
        categoryEnglish: "Tourism",
        imageFile: "/assets/discovery/visitBjelasnicaLogo.png",
        link: "#"
      }
    ]
  },
  playAndWin: {
    titleBosnian: "Flappy Bird",
    titleEnglish: "Flappy Bird",
    subtitleBosnian: "Igraj odmah - bez registracije",
    subtitleEnglish: "Play instantly - no signup",
    imageFile: "/assets/playandwin/flappybird.png",
    link: "https://saraya.games/"
  },
  games: [
    {
      id: "1",
      titleBosnian: "Memory Match",
      titleEnglish: "Memory Match",
      descriptionBosnian: "Pronađi parove kartica i testiraj svoju memoriju",
      descriptionEnglish: "Find matching pairs and test your memory",
      icon: "Brain",
      color: "violet",
      difficulty: "easy",
      players: "1",
      link: "#",
      featured: true
    },
    {
      id: "2",
      titleBosnian: "HotSpot Kviz",
      titleEnglish: "HotSpot Quiz",
      descriptionBosnian: "Odgovori na pitanja i osvoji nagrade",
      descriptionEnglish: "Answer questions and win prizes",
      icon: "Zap",
      color: "amber",
      difficulty: "medium",
      players: "1",
      link: "#",
      featured: true
    },
    {
      id: "3",
      titleBosnian: "Točak Sreće",
      titleEnglish: "Wheel of Fortune",
      descriptionBosnian: "Zavrti točak i osvoji popuste",
      descriptionEnglish: "Spin the wheel and win discounts",
      icon: "Target",
      color: "emerald",
      difficulty: "easy",
      players: "1",
      link: "#"
    },
    {
      id: "4",
      titleBosnian: "Slagalica",
      titleEnglish: "Puzzle Challenge",
      descriptionBosnian: "Složi sliku u što kraćem vremenu",
      descriptionEnglish: "Complete the puzzle as fast as you can",
      icon: "Puzzle",
      color: "blue",
      difficulty: "medium",
      players: "1",
      link: "#"
    },
    {
      id: "5",
      titleBosnian: "Baci Kocku",
      titleEnglish: "Roll the Dice",
      descriptionBosnian: "Testiraj svoju sreću i osvoji bodove",
      descriptionEnglish: "Test your luck and earn points",
      icon: "Dice1",
      color: "rose",
      difficulty: "easy",
      players: "1-4",
      link: "#"
    },
    {
      id: "6",
      titleBosnian: "Sarajevo Trivia",
      titleEnglish: "Sarajevo Trivia",
      descriptionBosnian: "Koliko dobro poznaješ Sarajevo?",
      descriptionEnglish: "How well do you know Sarajevo?",
      icon: "Sparkles",
      color: "cyan",
      difficulty: "hard",
      players: "1",
      link: "#"
    }
  ],
  utilities: {
    city: "Sarajevo",
    lat: 43.8563,
    lon: 18.4131,
    baseCurrency: "EUR",
    targetCurrencies: ["BAM", "USD"]
  },
  footer: {
    icons: [
      { id: "1", name: "NLB Banka", url: "#", icon: "/assets/blocks/icons/Nova_Ljubljanska_banka_logo.svg.png" },
      { id: "2", name: "Bingo", url: "#", icon: "/assets/blocks/icons/Bingo1.png" }
    ],
    styling: {
      footerBackground: "rgba(18, 18, 26, 1)",
      iconColor: "rgba(255, 255, 255, 1)",
      textColor: "rgba(255, 255, 255, 1)"
    }
  }
}

export interface TooltipContent {
  title: string
  description: string
  details?: string
}

export const instrumentTooltips: Record<string, TooltipContent> = {
  NIRCam: {
    title: "Near Infrared Camera",
    description: "JWST's primary imager, detecting light in the near-infrared spectrum (0.6-5.0 microns).",
    details: "NIRCam enables astronomers to see through cosmic dust clouds and observe the earliest galaxies formed after the Big Bang. It's also equipped with coronagraphs to study planets around other stars by blocking their host star's light."
  },
  MIRI: {
    title: "Mid-Infrared Instrument",
    description: "Captures mid-infrared light (5.0-28 microns) to reveal cooler objects and phenomena.",
    details: "MIRI can see through dense dust clouds to study newly forming stars and planets, analyze the composition of planet atmospheres, and observe distant galaxies. It operates at -266°C (-447°F), making it JWST's coldest instrument."
  },
  NIRSpec: {
    title: "Near Infrared Spectrograph",
    description: "Analyzes light spectra to determine composition, temperature, and motion of celestial objects.",
    details: "NIRSpec can observe up to 100 objects simultaneously using its microshutter array. This revolutionary capability allows astronomers to efficiently study the chemical makeup of distant galaxies, stars, and planetary atmospheres."
  },
  NIRISS: {
    title: "Near Infrared Imager and Slitless Spectrograph",
    description: "Specializes in detecting the faint signatures of exoplanet atmospheres and distant galaxies.",
    details: "NIRISS is optimized for three main functions: detecting the first light in the universe, characterizing exoplanet atmospheres through transit spectroscopy, and identifying extremely distant galaxies through wide-field imaging."
  }
}

export const distanceTooltips: Record<string, TooltipContent> = {
  lightYear: {
    title: "Light-Year",
    description: "The distance light travels in one year: approximately 9.46 trillion kilometers (5.88 trillion miles).",
    details: "Light moves at 299,792 km/s (186,282 mi/s). In cosmic terms, our nearest stellar neighbor Proxima Centauri is 4.24 light-years away, meaning we see it as it was 4.24 years ago."
  },
  lookbackTime: {
    title: "Lookback Time",
    description: "When we observe distant objects, we see them as they existed in the past because light takes time to reach us.",
    details: "The farther we look into space, the further back in time we see. JWST can observe galaxies over 13 billion light-years away, showing us the universe when it was only a few hundred million years old."
  },
  cosmicDistance: {
    title: "Cosmic Distance Ladder",
    description: "Astronomers use various methods to measure distances, from parallax for nearby stars to redshift for distant galaxies.",
    details: "For the most distant objects, astronomers measure redshift - how much light has been stretched by the universe's expansion. The greater the redshift, the farther away and further back in time we're observing."
  },
  redshift: {
    title: "Redshift (z)",
    description: "A measure of how much light has been stretched by the universe's expansion as it travels to us.",
    details: "Redshift tells us both distance and age. A redshift of z=1 means we're seeing the object as it was roughly 8 billion years ago. JWST has detected galaxies with redshift z>13, less than 400 million years after the Big Bang!"
  }
}

export const objectTypeTooltips: Record<string, TooltipContent> = {
  galaxy: {
    title: "Galaxies",
    description: "Massive gravitationally bound systems containing billions to trillions of stars, gas, dust, and dark matter.",
    details: "JWST observes galaxies from our cosmic neighborhood to the edge of the observable universe. Early galaxies appear surprisingly massive and structured, challenging our theories of galaxy formation."
  },
  nebula: {
    title: "Nebulae",
    description: "Vast clouds of gas and dust in space, often stellar nurseries where new stars are born.",
    details: "JWST's infrared vision pierces through dusty nebulae to reveal forming stars and planetary systems hidden from optical telescopes. Some nebulae are remnants of dead stars, enriching space with heavy elements."
  },
  star: {
    title: "Stars & Stellar Systems",
    description: "Massive spheres of plasma held together by gravity, generating energy through nuclear fusion.",
    details: "JWST studies stars throughout their lifecycles: from protostars hidden in cocoons of gas, to mature stars with planetary systems, to the dramatic deaths of massive stars as supernovae."
  },
  exoplanet: {
    title: "Exoplanets",
    description: "Planets orbiting stars beyond our solar system.",
    details: "JWST can detect and analyze the atmospheres of exoplanets by observing how starlight filters through them during transits. We're searching for biosignatures - chemical signs that could indicate life."
  }
}

export const generalTooltips = {
  infraredVision: {
    title: "Why Infrared?",
    description: "JWST observes in infrared light, which allows it to see through cosmic dust and detect the universe's earliest galaxies.",
    details: "As the universe expands, light from distant galaxies gets stretched (redshifted) from visible into infrared wavelengths. Infrared also penetrates dust clouds that block visible light, revealing hidden star formation and planetary systems."
  },
  jwstLocation: {
    title: "JWST's Orbit",
    description: "JWST orbits the Sun at L2, a gravitationally stable point 1.5 million km (1 million miles) from Earth.",
    details: "This location keeps Earth, Sun, and Moon always on the same side, allowing the sunshield to protect the telescope's cold instruments. L2 also provides an unobstructed view of deep space without Earth blocking the view."
  },
  cosmicTimeline: {
    title: "Cosmic Timeline View",
    description: "Objects arranged by distance are also arranged by time - the farther away, the earlier in cosmic history.",
    details: "The universe is 13.8 billion years old. When JWST observes a galaxy 13 billion light-years away, it sees that galaxy as it existed just 800 million years after the Big Bang, when the first stars and galaxies were forming."
  }
}

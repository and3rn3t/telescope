export interface TelescopeComponent {
  id: string
  name: string
  category: 'optics' | 'instruments' | 'structure' | 'power'
  description: string
  technicalDetails: string
  specifications: Record<string, string>
  importance: string
}

export const telescopeComponents: TelescopeComponent[] = [
  {
    id: 'primary-mirror',
    name: 'Primary Mirror',
    category: 'optics',
    description: 'The iconic gold-plated hexagonal mirror array that collects light from distant cosmic objects.',
    technicalDetails: 'Composed of 18 hexagonal beryllium segments, each 1.32 meters across, forming a 6.5-meter diameter collecting area. Coated with a microscopically thin layer of gold to optimize infrared reflection.',
    specifications: {
      'Diameter': '6.5 meters (21.3 feet)',
      'Collecting Area': '25.4 square meters',
      'Segments': '18 hexagonal pieces',
      'Material': 'Beryllium with gold coating',
      'Coating Thickness': '100 nanometers',
      'Operating Temperature': '-233°C (-387°F)'
    },
    importance: 'The primary mirror is 100x more powerful than Hubble, enabling JWST to see the first galaxies formed after the Big Bang.'
  },
  {
    id: 'secondary-mirror',
    name: 'Secondary Mirror',
    category: 'optics',
    description: 'Suspended on three support struts, this mirror redirects light from the primary mirror to the instruments.',
    technicalDetails: 'A circular convex mirror measuring 0.74 meters in diameter, positioned 7.6 meters in front of the primary mirror.',
    specifications: {
      'Diameter': '0.74 meters',
      'Shape': 'Convex circular',
      'Material': 'Beryllium with gold coating',
      'Support': 'Three carbon fiber struts',
      'Position': '7.6 meters from primary'
    },
    importance: 'Critical for focusing collected light precisely onto the scientific instruments with minimal distortion.'
  },
  {
    id: 'sunshield',
    name: 'Sunshield',
    category: 'structure',
    description: 'A five-layer tennis court-sized shield that protects the telescope from the Sun\'s heat and light.',
    technicalDetails: 'Each layer is made of Kapton, a material thinner than a human hair, with aluminum and silicon coatings. The layers are separated by gaps to radiate heat away.',
    specifications: {
      'Size': '21.2 x 14.2 meters',
      'Layers': '5 separate membranes',
      'Material': 'Kapton with coatings',
      'Temperature Difference': '300°C between sides',
      'SPF Equivalent': 'Over 1 million',
      'Thickness': '0.05mm per layer'
    },
    importance: 'Maintains instruments at -233°C, essential for detecting faint infrared signals from distant galaxies.'
  },
  {
    id: 'nircam',
    name: 'NIRCam',
    category: 'instruments',
    description: 'Near Infrared Camera - JWST\'s primary imager and wavefront sensor.',
    technicalDetails: 'Detects light from 0.6 to 5 microns with two channels (short and long wavelength), each with multiple filters and coronagraphs for exoplanet imaging.',
    specifications: {
      'Wavelength Range': '0.6 - 5.0 microns',
      'Field of View': '2.2 x 2.2 arcminutes',
      'Channels': '2 (short & long wave)',
      'Detectors': '10 mercury-cadmium-telluride arrays',
      'Resolution': '4096 x 4096 pixels',
      'Operating Temp': '-234°C (-389°F)'
    },
    importance: 'Enables discovery of the earliest galaxies and direct imaging of exoplanets by blocking starlight.'
  },
  {
    id: 'nirspec',
    name: 'NIRSpec',
    category: 'instruments',
    description: 'Near Infrared Spectrograph - analyzes light to determine composition and properties of celestial objects.',
    technicalDetails: 'Features a revolutionary microshutter array with 250,000 tiny shutters to simultaneously observe up to 100 objects, plus traditional slit and integral field unit modes.',
    specifications: {
      'Wavelength Range': '0.6 - 5.3 microns',
      'Spectral Resolution': 'R ~ 100 to 2700',
      'Microshutters': '248,000 individual shutters',
      'Field of View': '3.4 x 3.6 arcminutes',
      'Multi-object Capability': 'Up to 100 simultaneous',
      'Operating Temp': '-235°C (-391°F)'
    },
    importance: 'Revolutionary multi-object spectroscopy enables efficient study of distant galaxy evolution and exoplanet atmospheres.'
  },
  {
    id: 'miri',
    name: 'MIRI',
    category: 'instruments',
    description: 'Mid-Infrared Instrument - observes longer wavelengths to study cooler objects and dusty regions.',
    technicalDetails: 'The only mid-infrared instrument, requiring active cooling to -266°C. Combines camera and spectrograph capabilities with coronagraphic imaging.',
    specifications: {
      'Wavelength Range': '5.0 - 28.8 microns',
      'Camera FOV': '74 x 113 arcseconds',
      'Spectral Resolution': 'R ~ 1500 to 3500',
      'Operating Temp': '-266°C (-447°F)',
      'Cooling': 'Active cryocooler system',
      'Detectors': 'Arsenic-doped silicon arrays'
    },
    importance: 'JWST\'s coldest instrument, uniquely capable of studying planet formation, comets, and the coolest objects in the universe.'
  },
  {
    id: 'niriss',
    name: 'NIRISS',
    category: 'instruments',
    description: 'Near Infrared Imager and Slitless Spectrograph - specialized for exoplanet detection and distant galaxy studies.',
    technicalDetails: 'Canadian-built instrument with three primary modes: wide-field slitless spectroscopy, single-object slitless spectroscopy for exoplanet transits, and aperture masking interferometry.',
    specifications: {
      'Wavelength Range': '0.8 - 5.0 microns',
      'Field of View': '2.2 x 2.2 arcminutes',
      'Modes': '3 specialized observation modes',
      'Spectral Resolution': 'R ~ 150 to 700',
      'Operating Temp': '-234°C (-389°F)',
      'Detector': 'Mercury-cadmium-telluride array'
    },
    importance: 'Optimized for exoplanet atmosphere characterization and detecting the first light in the universe through gravitational lensing studies.'
  },
  {
    id: 'fgs',
    name: 'Fine Guidance Sensor',
    category: 'instruments',
    description: 'Precision pointing system that keeps JWST locked onto targets with incredible stability.',
    technicalDetails: 'Uses guide stars to maintain pointing accuracy better than 0.001 arcseconds, essential for long exposures and spectroscopy.',
    specifications: {
      'Pointing Accuracy': '0.001 arcseconds',
      'Field of View': '2.3 x 2.3 arcminutes',
      'Guide Stars': 'Tracks 2 simultaneously',
      'Update Rate': '16 times per second',
      'Sensitivity': 'Magnitude 19.5',
      'Operating Temp': '-234°C (-389°F)'
    },
    importance: 'Enables hours-long exposures with rock-steady precision, critical for detecting faint distant galaxies.'
  },
  {
    id: 'solar-arrays',
    name: 'Solar Arrays',
    category: 'power',
    description: 'Provides electrical power to operate all spacecraft systems and scientific instruments.',
    technicalDetails: 'Single deployable solar array panel with five sub-panels generating approximately 2 kilowatts of power at L2.',
    specifications: {
      'Total Area': '~21 square meters',
      'Power Output': '~2,000 watts at L2',
      'Type': 'Ultra Triple Junction GaAs',
      'Sub-panels': '5 segments',
      'Deployment': 'Single-sided array',
      'Orientation': 'Always faces the Sun'
    },
    importance: 'Provides continuous power for all operations while positioned to avoid interfering with observations.'
  },
  {
    id: 'spacecraft-bus',
    name: 'Spacecraft Bus',
    category: 'structure',
    description: 'The central support structure housing computers, communications, propulsion, and control systems.',
    technicalDetails: 'Contains flight computers, star trackers, reaction wheels, thrusters, high-gain antenna, and all subsystems needed to operate the telescope.',
    specifications: {
      'Computers': 'Redundant RAD750 processors',
      'Communications': 'Ka-band high-gain antenna',
      'Data Rate': 'Up to 28 Mbps downlink',
      'Propulsion': 'Bipropellant (hydrazine/nitrogen tetroxide)',
      'Fuel Capacity': '240 kg for 10+ years',
      'Attitude Control': '6 reaction wheels + thrusters'
    },
    importance: 'The brain and nervous system of JWST, managing all operations and transmitting discoveries back to Earth.'
  },
  {
    id: 'ote',
    name: 'Optical Telescope Element',
    category: 'structure',
    description: 'The complete optical system including mirrors, support structures, and precision alignment mechanisms.',
    technicalDetails: 'Integrates primary and secondary mirrors with sophisticated actuators that can adjust mirror positions with nanometer precision.',
    specifications: {
      'Total Mass': '~1,315 kg',
      'Mirror Actuators': '132 (126 primary, 6 secondary)',
      'Adjustment Range': 'Nanometer precision',
      'Focal Length': '131.4 meters',
      'F-number': 'f/20.2',
      'Material': 'Graphite composite structure'
    },
    importance: 'Provides the fundamental light-gathering and focusing capability that makes all JWST science possible.'
  },
  {
    id: 'backplane',
    name: 'Backplane Structure',
    category: 'structure',
    description: 'The rigid framework that holds all mirror segments in precise alignment despite temperature variations.',
    technicalDetails: 'Made of lightweight graphite composite with extremely low thermal expansion, maintaining mirror alignment even as temperatures change.',
    specifications: {
      'Mass': '~930 kg',
      'Material': 'Carbon fiber composite',
      'Thermal Stability': '<32 nanometers per °C',
      'Configuration': 'Center section + 2 wings',
      'Deployment': 'Wings fold for launch',
      'Dimensions': '8.4 x 2.5 meters deployed'
    },
    importance: 'Critical structural backbone ensuring mirror segments remain aligned to within nanometers for sharp imaging.'
  }
]

export interface TrajectoryPoint {
  id: string
  name: string
  description: string
  date: string
  type: 'past' | 'present' | 'future'
  position: { x: number; y: number }
  details: string
}

export const trajectoryData: TrajectoryPoint[] = [
  {
    id: 'launch',
    name: 'Launch from Earth',
    description: 'Launched on Ariane 5 rocket from French Guiana',
    date: 'December 25, 2021',
    type: 'past',
    position: { x: 10, y: 50 },
    details: 'JWST launched on Christmas Day 2021 after decades of development. The telescope was folded to fit inside the Ariane 5 rocket fairing, beginning its month-long journey to L2.'
  },
  {
    id: 'sunshield-deploy',
    name: 'Sunshield Deployment',
    description: 'Critical deployment of the five-layer sunshield',
    date: 'December 28, 2021 - January 4, 2022',
    type: 'past',
    position: { x: 20, y: 45 },
    details: 'Over several days, the sunshield unfolded and tensioned its five layers. This was one of the most critical deployment sequences, with hundreds of release mechanisms that had to work perfectly.'
  },
  {
    id: 'mirror-deploy',
    name: 'Mirror Deployment',
    description: 'Primary mirror wings unfold to full configuration',
    date: 'January 7-8, 2022',
    type: 'past',
    position: { x: 30, y: 40 },
    details: 'The primary mirror\'s side segments unfolded from their launch position, completing the full 6.5-meter mirror array. This marked the end of JWST\'s major deployments.'
  },
  {
    id: 'l2-insertion',
    name: 'L2 Orbit Insertion',
    description: 'Arrival at second Lagrange point',
    date: 'January 24, 2022',
    type: 'past',
    position: { x: 50, y: 35 },
    details: 'JWST executed its final major burn to insert into orbit around the L2 Lagrange point, 1.5 million km from Earth. This gravitationally stable location provides an ideal observing environment.'
  },
  {
    id: 'commissioning',
    name: 'Commissioning Phase',
    description: 'Mirror alignment and instrument calibration',
    date: 'January - June 2022',
    type: 'past',
    position: { x: 55, y: 30 },
    details: 'Six months of precise mirror alignment, instrument checkout, and calibration. Engineers adjusted 126 mirror actuators to align the 18 segments into a single perfect mirror with nanometer precision.'
  },
  {
    id: 'first-light',
    name: 'First Science Images',
    description: 'Release of first full-color deep field images',
    date: 'July 12, 2022',
    type: 'past',
    position: { x: 60, y: 30 },
    details: 'JWST\'s first science images were revealed to the world, showcasing unprecedented infrared views of galaxies, nebulae, and exoplanets. The deep field image showed galaxies over 13 billion light-years away.'
  },
  {
    id: 'current-position',
    name: 'Current Position',
    description: 'Operating at L2, conducting science observations',
    date: 'Present',
    type: 'present',
    position: { x: 70, y: 28 },
    details: 'JWST orbits L2 in a halo orbit, maintaining its position approximately 1.5 million km from Earth. The telescope continuously conducts observations while keeping its sunshield between the Sun and the mirrors.'
  },
  {
    id: 'extended-mission-1',
    name: 'Extended Mission Phase',
    description: 'Continued observations beyond primary mission',
    date: '2027-2030',
    type: 'future',
    position: { x: 80, y: 26 },
    details: 'After completing its primary 5-year mission, JWST is expected to continue observations for at least 5-10 more years, with fuel reserves sufficient for over 20 years of operation at L2.'
  },
  {
    id: 'station-keeping',
    name: 'Ongoing Station Keeping',
    description: 'Periodic adjustments to maintain L2 orbit',
    date: 'Throughout mission',
    type: 'future',
    position: { x: 75, y: 35 },
    details: 'Small thruster burns every 21 days keep JWST in its halo orbit around L2. These maneuvers consume minimal fuel, allowing decades of operation. The telescope can continue as long as instruments function.'
  },
  {
    id: 'end-of-mission',
    name: 'End of Mission',
    description: 'Projected end based on fuel reserves',
    date: '2040s (estimated)',
    type: 'future',
    position: { x: 90, y: 30 },
    details: 'JWST\'s mission will eventually end when fuel is exhausted or instruments fail. However, the telescope may continue operating for 20+ years. There are no plans to retrieve it - it will remain at L2 as a monument to human ingenuity.'
  }
]

export const orbitFacts = [
  {
    title: 'L2 Lagrange Point',
    description: 'JWST orbits the second Lagrange point (L2), a gravitationally stable location 1.5 million km from Earth, four times farther than the Moon.',
    icon: 'orbit'
  },
  {
    title: 'Halo Orbit',
    description: 'Rather than sitting exactly at L2, JWST traces a halo orbit around the point. This orbit takes about 6 months to complete and keeps the spacecraft in constant sunlight for solar power.',
    icon: 'path'
  },
  {
    title: 'Perfect Alignment',
    description: 'At L2, Earth, Moon, and Sun always remain on the same side of the telescope, allowing the sunshield to protect all instruments simultaneously while providing an unobstructed view of deep space.',
    icon: 'shield'
  },
  {
    title: 'Station Keeping',
    description: 'Small thruster burns every 21 days maintain JWST\'s orbit. With careful fuel management, the telescope can operate for over 20 years at L2.',
    icon: 'fuel'
  }
]

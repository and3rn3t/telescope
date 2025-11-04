import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Play, Pause, ArrowCounterClockwise, SkipForward, SkipBack, CheckCircle } from '@phosphor-icons/react'

interface DeploymentStep {
  id: string
  name: string
  description: string
  duration: string
  day: string
  technical: string
  criticality: 'critical' | 'high' | 'medium'
}

const deploymentSteps: DeploymentStep[] = [
  {
    id: 'launch',
    name: 'Launch Configuration',
    description: 'JWST is fully folded inside the Ariane 5 rocket fairing',
    duration: '0 hours',
    day: 'Day 0',
    technical: 'All components secured in folded configuration for launch. Primary mirror wings folded back, sunshield compacted, secondary mirror support tower stowed.',
    criticality: 'critical'
  },
  {
    id: 'solar-array',
    name: 'Solar Array Deployment',
    description: 'Solar panels unfold to provide power to the spacecraft',
    duration: '33 minutes after launch',
    day: 'Day 0',
    technical: 'Single-sided solar array deploys from stowed position. Five sub-panels unfold accordion-style to achieve full ~21 square meter surface area.',
    criticality: 'critical'
  },
  {
    id: 'antenna-deploy',
    name: 'High-Gain Antenna Deployment',
    description: 'Communications antenna deploys for Earth contact',
    duration: '2.5 hours after launch',
    day: 'Day 0',
    technical: 'High-gain antenna deploys to enable high-speed Ka-band communications at 28 Mbps with ground stations.',
    criticality: 'critical'
  },
  {
    id: 'sunshield-pallet',
    name: 'Sunshield Pallet Deploy',
    description: 'Forward and aft sunshield pallets lower into position',
    duration: 'Day 3-4',
    day: 'Day 3-4',
    technical: 'Forward pallet structure lowers, then aft pallet deploys. These structures form the support frame for the five sunshield layers.',
    criticality: 'critical'
  },
  {
    id: 'sunshield-unfold',
    name: 'Sunshield Unfolding',
    description: 'Tennis court-sized sunshield unfolds from its compact configuration',
    duration: 'Day 5-8',
    day: 'Day 5-8',
    technical: 'Sunshield membrane release devices activate. All five Kapton layers unfold simultaneously from their Z-fold configuration to nearly full size.',
    criticality: 'critical'
  },
  {
    id: 'sunshield-tension',
    name: 'Sunshield Layer Tensioning',
    description: 'Each of the five layers is individually separated and tensioned',
    duration: 'Day 8-10',
    day: 'Day 8-10',
    technical: 'Motor-driven tensioning systems pull each layer taut, creating precise gaps between layers for heat radiation. Each layer must achieve specific tension levels.',
    criticality: 'critical'
  },
  {
    id: 'secondary-mirror',
    name: 'Secondary Mirror Deployment',
    description: 'Secondary mirror support tower extends forward',
    duration: 'Day 11-12',
    day: 'Day 11-12',
    technical: 'Three-strut support tower extends from stowed position, moving secondary mirror 7.6 meters forward from primary mirror to final optical position.',
    criticality: 'critical'
  },
  {
    id: 'primary-wings',
    name: 'Primary Mirror Wing Deployment',
    description: 'Side segments of primary mirror unfold into final configuration',
    duration: 'Day 13-14',
    day: 'Day 13-14',
    technical: 'Left and right wing panels rotate outward, locking into position. Each wing contains 3 mirror segments, completing the 18-segment hexagonal array.',
    criticality: 'critical'
  },
  {
    id: 'complete',
    name: 'Deployment Complete',
    description: 'All major deployments finished - telescope in final form',
    duration: 'Day 14',
    day: 'Day 14',
    technical: 'Telescope achieves full deployed configuration. All 344 single-point failure items successfully deployed. Mirror alignment and commissioning phase begins.',
    criticality: 'high'
  }
]

export function DeploymentSequence() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)

  useEffect(() => {
    let interval: number | undefined
    if (isPlaying && currentStep < deploymentSteps.length - 1) {
      interval = window.setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= deploymentSteps.length - 1) {
            setIsPlaying(false)
            setHasCompleted(true)
            return prev
          }
          return prev + 1
        })
      }, 3000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, currentStep])

  const handlePlayPause = () => {
    if (currentStep >= deploymentSteps.length - 1) {
      setCurrentStep(0)
      setHasCompleted(false)
      setIsPlaying(true)
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
    setHasCompleted(false)
  }

  const handleNext = () => {
    if (currentStep < deploymentSteps.length - 1) {
      setCurrentStep(currentStep + 1)
      setIsPlaying(false)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setIsPlaying(false)
      setHasCompleted(false)
    }
  }

  const progress = ((currentStep + 1) / deploymentSteps.length) * 100
  const step = deploymentSteps[currentStep]

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground'
      case 'high':
        return 'bg-secondary text-secondary-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Deployment Sequence</h2>
        <p className="text-muted-foreground mt-2">
          Watch JWST unfold in space over 14 days - the most complex deployment ever attempted
        </p>
      </div>

      <Card className="border-2">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Deployment Progress</span>
                <span className="text-muted-foreground">
                  Step {currentStep + 1} of {deploymentSteps.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handlePlayPause}
                size="lg"
                className="gap-2"
              >
                {isPlaying ? (
                  <>
                    <Pause size={20} weight="fill" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={20} weight="fill" />
                    {hasCompleted ? 'Replay' : 'Play'}
                  </>
                )}
              </Button>
              <Button
                onClick={handleReset}
                variant="secondary"
                size="lg"
                className="gap-2"
              >
                <ArrowCounterClockwise size={20} />
                Reset
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={handlePrev}
                  variant="outline"
                  size="lg"
                  disabled={currentStep === 0}
                >
                  <SkipBack size={20} />
                </Button>
                <Button
                  onClick={handleNext}
                  variant="outline"
                  size="lg"
                  disabled={currentStep >= deploymentSteps.length - 1}
                >
                  <SkipForward size={20} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative aspect-square bg-gradient-to-br from-background via-primary/5 to-background rounded-lg border-2 border-border overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center p-8"
            >
              <DeploymentVisualization step={step.id} />
            </motion.div>
          </AnimatePresence>

          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="text-sm font-mono">
              {step.day}
            </Badge>
          </div>

          {hasCompleted && currentStep === deploymentSteps.length - 1 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="absolute top-4 left-4"
            >
              <div className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-2 rounded-lg">
                <CheckCircle size={20} weight="fill" />
                <span className="font-semibold text-sm">Complete!</span>
              </div>
            </motion.div>
          )}
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <motion.h3
                  key={`title-${currentStep}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl font-bold"
                >
                  {step.name}
                </motion.h3>
                <motion.p
                  key={`duration-${currentStep}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm text-muted-foreground mt-1 font-mono"
                >
                  {step.duration}
                </motion.p>
              </div>
              <Badge className={getCriticalityColor(step.criticality)}>
                {step.criticality}
              </Badge>
            </div>

            <motion.p
              key={`desc-${currentStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-foreground"
            >
              {step.description}
            </motion.p>

            <motion.div
              key={`tech-${currentStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 bg-muted/50 rounded-lg"
            >
              <h4 className="font-semibold text-sm mb-2">Technical Details</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.technical}
              </p>
            </motion.div>

            {step.id === 'complete' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 bg-secondary/20 border border-secondary rounded-lg"
              >
                <p className="text-sm text-foreground">
                  <strong>Success Rate:</strong> All 344 single-point failure items deployed successfully. 
                  JWST became the most complex spacecraft ever deployed in space, with zero failures 
                  during the deployment sequence.
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Deployment Timeline</h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-4">
              {deploymentSteps.map((s, index) => (
                <motion.button
                  key={s.id}
                  onClick={() => {
                    setCurrentStep(index)
                    setIsPlaying(false)
                  }}
                  className={`relative flex items-start gap-4 w-full text-left p-3 rounded-lg transition-colors ${
                    index === currentStep
                      ? 'bg-primary/10 border border-primary/30'
                      : index < currentStep
                      ? 'bg-muted/50 hover:bg-muted'
                      : 'hover:bg-muted/30'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      index < currentStep
                        ? 'bg-secondary border-secondary'
                        : index === currentStep
                        ? 'bg-primary border-primary'
                        : 'bg-background border-border'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle size={16} weight="fill" className="text-secondary-foreground" />
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm">{s.name}</h4>
                      <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
                        {s.day}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {s.description}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DeploymentVisualization({ step }: { step: string }) {
  const variants = {
    launch: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <motion.rect
          x="70"
          y="40"
          width="60"
          height="120"
          fill="currentColor"
          className="text-primary/20"
          rx="4"
        />
        <motion.path
          d="M 80 80 L 90 80 L 90 100 L 80 100 Z"
          fill="currentColor"
          className="text-primary"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.path
          d="M 110 80 L 120 80 L 120 100 L 110 100 Z"
          fill="currentColor"
          className="text-primary"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse', delay: 0.2 }}
        />
        <text x="100" y="180" textAnchor="middle" className="text-xs fill-muted-foreground">
          Stowed Configuration
        </text>
      </svg>
    ),
    'solar-array': (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <motion.rect
          x="70"
          y="70"
          width="60"
          height="60"
          fill="currentColor"
          className="text-primary/20"
          rx="4"
        />
        <motion.g
          initial={{ scaleX: 0, originX: '0px' }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <rect x="130" y="75" width="8" height="50" fill="currentColor" className="text-secondary" />
          <rect x="138" y="75" width="8" height="50" fill="currentColor" className="text-secondary/80" />
          <rect x="146" y="75" width="8" height="50" fill="currentColor" className="text-secondary/60" />
        </motion.g>
        <text x="100" y="180" textAnchor="middle" className="text-xs fill-muted-foreground">
          Solar Array Deployed
        </text>
      </svg>
    ),
    'antenna-deploy': (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <motion.rect
          x="70"
          y="80"
          width="60"
          height="50"
          fill="currentColor"
          className="text-primary/20"
          rx="4"
        />
        <motion.g
          initial={{ rotate: -90, originX: '100px', originY: '80px' }}
          animate={{ rotate: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <circle cx="100" cy="65" r="15" fill="currentColor" className="text-accent" />
          <path
            d="M 95 60 L 100 50 L 105 60"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-accent-foreground"
          />
        </motion.g>
        <text x="100" y="180" textAnchor="middle" className="text-xs fill-muted-foreground">
          Antenna Deployed
        </text>
      </svg>
    ),
    'sunshield-pallet': (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <motion.rect
          x="60"
          y="60"
          width="80"
          height="40"
          fill="currentColor"
          className="text-primary/20"
          rx="4"
        />
        <motion.rect
          x="50"
          y="100"
          width="100"
          height="8"
          fill="currentColor"
          className="text-muted"
          initial={{ y: 60 }}
          animate={{ y: 100 }}
          transition={{ duration: 1.5 }}
        />
        <motion.rect
          x="50"
          y="130"
          width="100"
          height="8"
          fill="currentColor"
          className="text-muted"
          initial={{ y: 100 }}
          animate={{ y: 130 }}
          transition={{ duration: 1.5, delay: 0.3 }}
        />
        <text x="100" y="180" textAnchor="middle" className="text-xs fill-muted-foreground">
          Pallet Structures
        </text>
      </svg>
    ),
    'sunshield-unfold': (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <motion.rect
          x="60"
          y="50"
          width="80"
          height="30"
          fill="currentColor"
          className="text-primary/20"
          rx="4"
        />
        <motion.g
          initial={{ scaleX: 0.3, originX: '100px' }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        >
          <rect x="40" y="90" width="120" height="3" fill="currentColor" className="text-accent" opacity="0.2" />
          <rect x="40" y="95" width="120" height="3" fill="currentColor" className="text-accent" opacity="0.4" />
          <rect x="40" y="100" width="120" height="3" fill="currentColor" className="text-accent" opacity="0.6" />
          <rect x="40" y="105" width="120" height="3" fill="currentColor" className="text-accent" opacity="0.8" />
          <rect x="40" y="110" width="120" height="3" fill="currentColor" className="text-accent" />
        </motion.g>
        <text x="100" y="180" textAnchor="middle" className="text-xs fill-muted-foreground">
          Sunshield Unfolding
        </text>
      </svg>
    ),
    'sunshield-tension': (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <motion.rect
          x="60"
          y="40"
          width="80"
          height="25"
          fill="currentColor"
          className="text-primary/20"
          rx="4"
        />
        <motion.g>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.rect
              key={i}
              x="35"
              y={75 + i * 10}
              width="130"
              height="2"
              fill="currentColor"
              className="text-accent"
              opacity={1 - i * 0.15}
              initial={{ scaleX: 0.7 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: i * 0.2 }}
            />
          ))}
        </motion.g>
        <text x="100" y="180" textAnchor="middle" className="text-xs fill-muted-foreground">
          Layer Tensioning
        </text>
      </svg>
    ),
    'secondary-mirror': (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <motion.rect
          x="60"
          y="100"
          width="80"
          height="40"
          fill="currentColor"
          className="text-primary/20"
          rx="4"
        />
        <motion.g
          initial={{ y: 30 }}
          animate={{ y: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <line x1="85" y1="100" x2="100" y2="60" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
          <line x1="115" y1="100" x2="100" y2="60" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
          <ellipse cx="100" cy="60" rx="20" ry="6" fill="currentColor" className="text-secondary" />
        </motion.g>
        <text x="100" y="180" textAnchor="middle" className="text-xs fill-muted-foreground">
          Secondary Mirror Up
        </text>
      </svg>
    ),
    'primary-wings': (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <motion.g
          initial={{ rotate: -30, originX: '100px', originY: '100px' }}
          animate={{ rotate: 0 }}
          transition={{ duration: 1.5 }}
        >
          <path
            d="M 50 80 L 70 70 L 70 130 L 50 120 Z"
            fill="currentColor"
            className="text-secondary"
          />
        </motion.g>
        <path
          d="M 70 70 L 90 80 L 90 120 L 70 130 Z"
          fill="currentColor"
          className="text-secondary"
        />
        <path
          d="M 90 80 L 110 80 L 110 120 L 90 120 Z"
          fill="currentColor"
          className="text-secondary"
        />
        <motion.g
          initial={{ rotate: 30, originX: '100px', originY: '100px' }}
          animate={{ rotate: 0 }}
          transition={{ duration: 1.5 }}
        >
          <path
            d="M 110 80 L 130 70 L 130 130 L 110 120 Z"
            fill="currentColor"
            className="text-secondary"
          />
          <path
            d="M 130 70 L 150 80 L 150 120 L 130 130 Z"
            fill="currentColor"
            className="text-secondary"
          />
        </motion.g>
        <ellipse cx="100" cy="50" rx="15" ry="5" fill="currentColor" className="text-accent" />
        <text x="100" y="180" textAnchor="middle" className="text-xs fill-muted-foreground">
          Mirror Wings Open
        </text>
      </svg>
    ),
    complete: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <motion.g
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <path
            d="M 40 80 L 60 70 L 80 80 L 100 80 L 120 80 L 140 70 L 160 80 L 140 130 L 120 120 L 100 120 L 80 120 L 60 130 Z"
            fill="currentColor"
            className="text-secondary"
          />
          <ellipse cx="100" cy="50" rx="15" ry="5" fill="currentColor" className="text-accent" />
          <rect x="30" y="140" width="140" height="2" fill="currentColor" className="text-accent" opacity="0.8" />
          <rect x="30" y="145" width="140" height="2" fill="currentColor" className="text-accent" opacity="0.6" />
          <rect x="30" y="150" width="140" height="2" fill="currentColor" className="text-accent" opacity="0.4" />
        </motion.g>
        <motion.g
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1" fill="none" className="text-primary/20" />
        </motion.g>
        <text x="100" y="185" textAnchor="middle" className="text-xs fill-muted-foreground font-semibold">
          Fully Deployed
        </text>
      </svg>
    )
  }

  return variants[step as keyof typeof variants] || variants.launch
}

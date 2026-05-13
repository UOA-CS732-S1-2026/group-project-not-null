import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '../button'
import { analyzeTicketPriority } from '../../services/api.js'
import { fallbackPriorityFromUrgency } from '../../services/ticket-mappers.js'
import './AITriageCard.css'

export default function AITriageCard({ formData, onPriorityChange }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasAnalyzedPriority, setHasAnalyzedPriority] = useState(false)
  const [priorityAnalysis, setPriorityAnalysis] = useState(() => ({
    priority: fallbackPriorityFromUrgency(formData.urgencyLevel),
    reason: 'Priority will be checked after you describe the issue.',
    fallback: true,
  }))

  useEffect(() => {
    const fallbackPriority = fallbackPriorityFromUrgency(formData.urgencyLevel)
    onPriorityChange(fallbackPriority)

    if (formData.description.trim().length < 20) {
      setHasAnalyzedPriority(false)
      setPriorityAnalysis({
        priority: fallbackPriority,
        reason: 'Add a little more detail so AI triage can check this priority.',
        fallback: true,
      })
      return undefined
    }

    setHasAnalyzedPriority(false)
    setPriorityAnalysis({
      priority: fallbackPriority,
      reason: 'Priority will be checked after you finish describing the issue.',
      fallback: true,
    })

    const timerId = window.setTimeout(() => {
      checkPriority()
    }, 900)

    return () => window.clearTimeout(timerId)
  }, [formData.description, formData.category, formData.urgencyLevel])

  async function checkPriority() {
    const fallbackPriority = fallbackPriorityFromUrgency(formData.urgencyLevel)

    if (formData.description.trim().length < 20) {
      setPriorityAnalysis({
        priority: fallbackPriority,
        reason: 'Add a little more detail so AI triage can check this priority.',
        fallback: true,
      })
      onPriorityChange(fallbackPriority)
      return
    }

    setIsAnalyzing(true)

    try {
      const analysis = await analyzeTicketPriority({
        description: formData.description,
        department: formData.category,
        urgencyLevel: formData.urgencyLevel,
      })
      const priority = analysis.priority || fallbackPriority

      setPriorityAnalysis({
        priority,
        reason: analysis.reason || 'Priority was assigned by AI triage.',
        fallback: Boolean(analysis.fallback),
      })
      setHasAnalyzedPriority(true)
      onPriorityChange(priority)
    } catch (err) {
      setPriorityAnalysis({
        priority: fallbackPriority,
        reason: 'AI triage is unavailable, so priority is based on your selected urgency.',
        fallback: true,
      })
      setHasAnalyzedPriority(true)
      onPriorityChange(fallbackPriority)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <section className="ai-priority-card" aria-live="polite">
      <header className="ai-priority-header">
        <span>AI Intelligence Suite</span>
        <span className="ai-live-status">
          <span aria-hidden="true"></span>
          Live
        </span>
      </header>

      <div className="ai-priority-content">
        <p className={isAnalyzing ? 'ai-priority-message is-shimmering' : 'ai-priority-message'}>
          Our AI model is ready to analyze your ticket context for optimized routing.
        </p>
      </div>

      <div className="ai-priority-result">
        <span>Priority:</span>
        <strong
          className={`priority-value ${hasAnalyzedPriority && !isAnalyzing ? 'is-ready' : ''}`}
          key={`${priorityAnalysis.priority}-${hasAnalyzedPriority}-${isAnalyzing}`}
        >
          {isAnalyzing
            ? 'Analyzing'
            : hasAnalyzedPriority
              ? priorityAnalysis.priority
              : 'Pending'}
        </strong>
      </div>

      <p className="ai-priority-reason">{priorityAnalysis.reason}</p>

      <Button
        className="ai-priority-button"
        type="button"
        disabled={isAnalyzing || formData.description.trim().length < 20}
        onClick={checkPriority}
      >
        <Sparkles aria-hidden="true" size={18} />
        {isAnalyzing ? 'Analyzing...' : 'Check Priority'}
      </Button>

      {priorityAnalysis.fallback && (
        <p className="ai-priority-note">
          Note: fallback uses your selected urgency so the ticket can still be submitted.
        </p>
      )}
    </section>
  )
}

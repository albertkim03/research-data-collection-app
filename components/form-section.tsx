"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

interface FormSectionProps {
  sectionNumber: number
  userId: string
}

const SECTION_FORMS: Record<number, any> = {
  1: {
    title: "Section 1: Background Information",
    questions: [
      {
        id: "age",
        type: "text",
        label: "Age",
        placeholder: "Enter your age",
      },
      {
        id: "gender",
        type: "radio",
        label: "Gender",
        options: ["Male", "Female", "Non-binary", "Prefer to say"],
      },
      {
        id: "experience",
        type: "text",
        label: "Years of relevant experience",
        placeholder: "Enter number of years",
      },
    ],
  },
  2: {
    title: "Section 2: Core Research Questions",
    questions: [
      {
        id: "q1",
        type: "radio",
        label: "How would you rate your satisfaction with the current system?",
        options: ["Very Unsatisfied", "Unsatisfied", "Neutral", "Satisfied", "Very Satisfied"],
      },
      {
        id: "q2",
        type: "text",
        label: "What is the primary challenge you face?",
        placeholder: "Please describe",
      },
      {
        id: "q3",
        type: "checkbox",
        label: "Which of the following apply to you? (Select all that apply)",
        options: ["Option A", "Option B", "Option C", "Option D"],
      },
    ],
  },
  3: {
    title: "Section 3: Follow-up and Conclusions",
    questions: [
      {
        id: "q1",
        type: "text",
        label: "What improvements would you suggest?",
        placeholder: "Share your suggestions",
      },
      {
        id: "q2",
        type: "radio",
        label: "Would you recommend this to others?",
        options: ["Definitely Not", "Probably Not", "Undecided", "Probably Yes", "Definitely Yes"],
      },
      {
        id: "q3",
        type: "text",
        label: "Additional comments",
        placeholder: "Any additional thoughts?",
      },
    ],
  },
}

export default function FormSection({ sectionNumber, userId }: FormSectionProps) {
  const form = SECTION_FORMS[sectionNumber]
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const supabase = createClient()

  const handleInputChange = (questionId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    setResponses((prev) => {
      const current = prev[questionId] || []
      if (checked) {
        return {
          ...prev,
          [questionId]: [...current, option],
        }
      }
      return {
        ...prev,
        [questionId]: current.filter((item: string) => item !== option),
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.from("form_responses").insert({
        user_id: userId,
        section_number: sectionNumber,
        responses,
      })

      if (error) throw error

      setMessage({
        type: "success",
        text: "Form submitted successfully!",
      })
      setResponses({})
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to submit form",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {form.questions.map((question: any) => (
          <div key={question.id} className="space-y-3">
            <Label className="text-base font-medium">{question.label}</Label>

            {question.type === "text" && (
              <Input
                placeholder={question.placeholder}
                value={responses[question.id] || ""}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
              />
            )}

            {question.type === "radio" && (
              <RadioGroup
                value={responses[question.id] || ""}
                onValueChange={(value) => handleInputChange(question.id, value)}
              >
                <div className="space-y-2">
                  {question.options.map((option: string) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                      <Label htmlFor={`${question.id}-${option}`} className="font-normal">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {question.type === "checkbox" && (
              <div className="space-y-2">
                {question.options.map((option: string) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${question.id}-${option}`}
                      checked={(responses[question.id] || []).includes(option)}
                      onCheckedChange={(checked) => handleCheckboxChange(question.id, option, checked as boolean)}
                    />
                    <Label htmlFor={`${question.id}-${option}`} className="font-normal">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {message && (
          <div
            className={`p-4 rounded-lg text-sm ${
              message.type === "success" ? "bg-accent/10 text-accent" : "bg-error/10 text-error"
            }`}
          >
            {message.text}
          </div>
        )}

        <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary-light">
          {isLoading ? "Submitting..." : "Submit Form"}
        </Button>
      </form>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface SectionFormProps {
  section: {
    id: string
    section_number: number
    title: string
  }
  userId: string
  initialData: Record<string, string> | null
}

export default function SectionForm({ section, userId, initialData }: SectionFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Form fields based on section number
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    if (initialData) {
      return initialData
    }
    // Default form structure based on section
    if (section.section_number === 1) {
      return {
        age_range: "",
        gender: "",
        occupation: "",
        education_level: "",
        country: "",
      }
    } else if (section.section_number === 2) {
      return {
        years_experience: "",
        key_challenges: "",
        positive_experiences: "",
        recommendations: "",
      }
    } else {
      return {
        overall_feedback: "",
        most_valuable: "",
        areas_improvement: "",
        additional_comments: "",
      }
    }
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setIsDirty(true)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)

    try {
      // Check if response already exists
      const { data: existing } = await supabase
        .from("form_responses")
        .select("id")
        .eq("user_id", userId)
        .eq("section_id", section.id)
        .single()

      let result
      if (existing) {
        // Update existing response
        result = await supabase
          .from("form_responses")
          .update({
            response_data: formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
      } else {
        // Insert new response
        result = await supabase.from("form_responses").insert({
          user_id: userId,
          section_id: section.id,
          response_data: formData,
        })
      }

      if (result.error) {
        throw result.error
      }

      setSuccess(true)
      setIsDirty(false)
      setTimeout(() => {
        router.push("/sections")
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit form")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Render form fields based on section
  const renderFormFields = () => {
    if (section.section_number === 1) {
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="age_range" className="font-semibold">
              Age Range <span className="text-destructive">*</span>
            </Label>
            <select
              id="age_range"
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/50 transition-all"
              value={formData.age_range}
              onChange={(e) => handleChange("age_range", e.target.value)}
              required
            >
              <option value="">Select age range</option>
              <option value="18-25">18-25</option>
              <option value="26-35">26-35</option>
              <option value="36-45">36-45</option>
              <option value="46-55">46-55</option>
              <option value="56-65">56-65</option>
              <option value="66+">66+</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="font-semibold">
              Gender <span className="text-destructive">*</span>
            </Label>
            <select
              id="gender"
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/50 transition-all"
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation" className="font-semibold">
              Occupation <span className="text-destructive">*</span>
            </Label>
            <Input
              id="occupation"
              type="text"
              placeholder="Your occupation"
              value={formData.occupation}
              onChange={(e) => handleChange("occupation", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="education_level" className="font-semibold">
              Education Level <span className="text-destructive">*</span>
            </Label>
            <select
              id="education_level"
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/50 transition-all"
              value={formData.education_level}
              onChange={(e) => handleChange("education_level", e.target.value)}
              required
            >
              <option value="">Select education level</option>
              <option value="high_school">High School</option>
              <option value="bachelor">Bachelor's Degree</option>
              <option value="master">Master's Degree</option>
              <option value="phd">PhD</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className="font-semibold">
              Country <span className="text-destructive">*</span>
            </Label>
            <Input
              id="country"
              type="text"
              placeholder="Your country"
              value={formData.country}
              onChange={(e) => handleChange("country", e.target.value)}
              required
            />
          </div>
        </>
      )
    } else if (section.section_number === 2) {
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="years_experience" className="font-semibold">
              Years of Experience <span className="text-destructive">*</span>
            </Label>
            <Input
              id="years_experience"
              type="number"
              placeholder="Number of years"
              value={formData.years_experience}
              onChange={(e) => handleChange("years_experience", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="key_challenges" className="font-semibold">
              Key Challenges Faced <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="key_challenges"
              placeholder="Describe the main challenges you've experienced"
              value={formData.key_challenges}
              onChange={(e) => handleChange("key_challenges", e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="positive_experiences" className="font-semibold">
              Positive Experiences <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="positive_experiences"
              placeholder="Share your positive experiences and achievements"
              value={formData.positive_experiences}
              onChange={(e) => handleChange("positive_experiences", e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendations" className="font-semibold">
              Recommendations <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="recommendations"
              placeholder="What recommendations do you have?"
              value={formData.recommendations}
              onChange={(e) => handleChange("recommendations", e.target.value)}
              required
              rows={4}
            />
          </div>
        </>
      )
    } else {
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="overall_feedback" className="font-semibold">
              Overall Feedback <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="overall_feedback"
              placeholder="Please provide your overall feedback"
              value={formData.overall_feedback}
              onChange={(e) => handleChange("overall_feedback", e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="most_valuable" className="font-semibold">
              Most Valuable Aspect <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="most_valuable"
              placeholder="What was most valuable in this research?"
              value={formData.most_valuable}
              onChange={(e) => handleChange("most_valuable", e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="areas_improvement" className="font-semibold">
              Areas for Improvement <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="areas_improvement"
              placeholder="What areas could be improved?"
              value={formData.areas_improvement}
              onChange={(e) => handleChange("areas_improvement", e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional_comments" className="font-semibold">
              Additional Comments
            </Label>
            <Textarea
              id="additional_comments"
              placeholder="Any additional comments or thoughts"
              value={formData.additional_comments}
              onChange={(e) => handleChange("additional_comments", e.target.value)}
              rows={4}
            />
          </div>
        </>
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {renderFormFields()}

      {error && (
        <div className="flex gap-3 items-start p-4 bg-destructive/10 border border-destructive/30 rounded-lg animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex gap-3 items-start p-4 bg-emerald-50 border border-emerald-200 rounded-lg animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-700 font-medium">Response saved successfully! Redirecting...</p>
        </div>
      )}

      {isDirty && !success && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded text-center">You have unsaved changes</div>
      )}

      <div className="flex gap-3 pt-4 border-t border-border">
        <Button
          type="submit"
          disabled={isLoading || success || !isDirty}
          className="bg-primary hover:bg-primary-dark flex-1 transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Response"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

import { useState } from 'react'
import Rating from './Rating'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Checkbox } from '../../components/ui/checkbox'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Card } from '../../components/ui/card'
import { CardContent } from '../../components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { Separator } from '../../components/ui/separator'

export default function ReviewForm({
  onSubmit,
  onCancel,
  entityName,
  isInstructor = false,
  initialData = null,
  isEditing = false
}) {
  const [formData, setFormData] = useState(initialData || {
    rating: 0,
    title: '',
    comment: '',
    anonymous: false,
    ...(isInstructor && { reply: '' })
  })

  const [hoverRating, setHoverRating] = useState(0)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!isInstructor && formData.rating === 0) {
      setError('Please select a rating')
      return
    }

    if (formData.title.trim() === '' && !isInstructor) {
      setError('Please add a title')
      return
    }

    if (isInstructor && formData.reply.trim() === '') {
      setError('Please write a response')
      return
    }

    onSubmit(formData)
  }

  return (
    <Card className={`${isInstructor ? 'border-l-4 border-indigo-500' : ''}`}>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">
            {isInstructor ? 'Respond to Review' : `Review ${entityName}`} {isEditing && ' (Editing)'}
          </h2>
          <Separator />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {!isInstructor && (
            <div className="space-y-1">
              <Label>Your Rating</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  >
                    <svg
                      className={`h-8 w-8 ${(hoverRating || formData.rating) >= star ? 'text-yellow-400' : 'text-muted'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                <span className="text-sm text-muted-foreground">
                  {formData.rating > 0 ? `${formData.rating} star${formData.rating !== 1 ? 's' : ''}` : 'Not rated'}
                </span>
              </div>
            </div>
          )}

          {!isInstructor && (
            <div className="space-y-1">
              <Label htmlFor="title">Review Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required={!isInstructor}
              />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor={isInstructor ? 'reply' : 'comment'}>
              {isInstructor ? 'Your Response *' : 'Detailed Review'}
            </Label>
            <Textarea
              id={isInstructor ? 'reply' : 'comment'}
              name={isInstructor ? 'reply' : 'comment'}
              rows={4}
              value={isInstructor ? formData.reply : formData.comment}
              onChange={handleChange}
              required={isInstructor}
              placeholder={
                isInstructor
                  ? 'Write a professional response to this review...'
                  : 'Share your detailed experience with this course...'
              }
            />
          </div>

          {!isInstructor && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="anonymous"
                name="anonymous"
                checked={formData.anonymous}
                onCheckedChange={() =>
                  setFormData(prev => ({ ...prev, anonymous: !formData.anonymous }))
                }
              />
              <Label htmlFor="anonymous">Post anonymously</Label>
            </div>
          )}

          <div className="rounded-md border p-3 bg-muted/30">
            <h4 className="text-sm font-medium mb-1">
              {isInstructor ? 'Response Tips:' : 'Review Tips:'}
            </h4>
            <ul className="text-xs list-disc list-inside space-y-1">
              {isInstructor ? (
                <>
                  <li>Be professional and constructive</li>
                  <li>Address specific points from the review</li>
                  <li>Thank the student for their feedback</li>
                </>
              ) : (
                <>
                  <li>Share what you liked about the course</li>
                  <li>Be specific about what could be improved</li>
                  <li>Avoid personal comments about the instructor</li>
                </>
              )}
            </ul>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {isInstructor ? 'Submit Response' : isEditing ? 'Update Review' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

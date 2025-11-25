import { useState } from "react"
import { useSelector } from "react-redux"
import { Button, Label, Textarea } from "flowbite-react"
import { useError } from "../contexts/ErrorContext"
import { useSuccess } from "../contexts/SuccessContext"
import { createAuthorRequest } from "../api/authorRequestsApi"

export default function RequestAuthorForm() {
  const { loading } = useSelector((state) => state.user)
  const { currentUser } = useSelector(state => state.user)

  const [reason, setReason] = useState('')
  const [authorRequests, setAuthorRequests] = useState([])

  const { showError } = useError()
  const { showSuccess } = useSuccess()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const payload = {
        status: 1,
        reason,
        idUser: currentUser.id,
        idRole: currentUser.idRole
      }

      const data = await createAuthorRequest(payload)

      setAuthorRequests((prev) => [...prev, data])
      setReason('')
      showSuccess('Successfully submitted request')
    } catch (error) {
      showError(error.message)
    }
  }

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Submit an author request</h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="">
          <div className="mb-2 block">
            <Label htmlFor="requestAuthorFormTag" value="Why do you want to become an author?" />
          </div>
          <Textarea id="requestAuthorFormTag" value={reason} onChange={(e) => setReason(e.target.value)} required rows={4} />
        </div>

        <Button type="submit" gradientDuoTone='purpleToBlue' outline disabled={loading}>{loading ? 'Loading...' : 'Submit Request'}</Button>
      </form>
    </div>
  )
}

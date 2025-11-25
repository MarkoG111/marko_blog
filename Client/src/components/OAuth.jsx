import { Button } from "flowbite-react"
import { AiFillGoogleCircle } from "react-icons/ai"
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { jwtDecode } from 'jwt-decode'
import { signInSuccess } from "../redux/user/userSlice"
import { app } from "../firebase"
import { useError } from "../contexts/ErrorContext"
import { useState } from "react"
import { googleSignIn } from "../api/authApi"

export default function OAuth() {
  const [loading, setLoading] = useState(false)

  const auth = getAuth(app)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { showError } = useError()

  const handleGoogleClick = async () => {
    if (loading) return
    setLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })

      const resultsFromGoogle = await signInWithPopup(auth, provider)

      const payload = {
        name: resultsFromGoogle.user.displayName,
        email: resultsFromGoogle.user.email,
        googlePhotoUrl: resultsFromGoogle.user.photoURL
      }

      const { token } = await googleSignIn(payload)
      const decodedToken = jwtDecode(token)
      const userProfile = decodedToken.ActorData

      localStorage.setItem('token', token)
      dispatch(signInSuccess(userProfile))
      navigate('/')
    } catch (error) {
      showError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button type="button" gradientDuoTone='pinkToOrange' outline onClick={handleGoogleClick} disabled={loading} >
      <AiFillGoogleCircle className='w-6 h-6 mr-2' />
      {loading ? "Loading..." : "Continue with Google"}
    </Button>
  )
}
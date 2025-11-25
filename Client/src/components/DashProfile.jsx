import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { updateUserSuccess, signoutSuccess, updateProfilePictureSuccess } from '../redux/user/userSlice'
import { Button, Modal, TextInput } from "flowbite-react"
import { HiOutlineExclamationCircle } from 'react-icons/hi'
import { useError } from "../contexts/ErrorContext"
import { getAvatarSrc } from "../utils/getAvatarSrc"
import { updateUser, deleteUser } from "../api/usersApi"
import { useSuccess } from "../contexts/SuccessContext"

export default function DashProfile() {
  const { currentUser, loading } = useSelector((state) => state.user)

  const [imageFile, setImageFile] = useState(null)
  const [imageFileUrl, setImageFileUrl] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const filePickerRef = useRef()

  const dispatch = useDispatch()

  const { showError } = useError()
  const { showSuccess } = useSuccess()

  const handleImagechange = (e) => {
    const file = e.target.files[0]

    if (file) {
      setImageFile(file)
      setImageFileUrl(URL.createObjectURL(file))
    }
  }

  useEffect(() => {
    return () => {
      if (imageFileUrl) {
        URL.revokeObjectURL(imageFileUrl)
      }
    }
  }, [imageFileUrl, imageFile, currentUser.profilePicture])


  const handleFormSubmit = async (e) => {
    e.preventDefault();

    console.log("SUBMIT FIRED!");

    const token = localStorage.getItem("token");
    if (!token) {
      showError("Token not found");
      return;
    }

    const formData = new FormData();
    formData.append("Id", currentUser.id);
    formData.append("FirstName", e.target.elements.firstName.value);
    formData.append("LastName", e.target.elements.lastName.value);
    formData.append("Username", e.target.elements.username.value);
    formData.append("Email", e.target.elements.email.value);
    formData.append("Password", e.target.elements.password.value);
    formData.append("IdRole", currentUser.idRole);

    if (imageFile) {
      formData.append("Image", imageFile);
    }

    // Debug — proveri šta se šalje
    for (let pair of formData.entries()) {
      console.log("FORMDATA:", pair[0], pair[1]);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${currentUser.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
          // ❗ NE SMEŠ ovde dodati Content-Type !!!
          // Browser će dodati multipart/form-data sam.
        },
        body: formData
      });

      console.log("RAW RESPONSE:", response);

      if (!response.ok) {
        let txt = await response.text();
        console.error("SERVER ERROR:", txt);
        showError(txt || "Error");
        return;
      }

      const data = await response.json();

      dispatch(updateUserSuccess(data));
      dispatch(updateProfilePictureSuccess(data.profilePicture));

      showSuccess("Profile updated!");
    } catch (err) {
      console.error("CLIENT ERROR:", err);
      showError(err.message);
    }
  };


  const handleDeleteUser = async () => {
    setShowModal(false)

    try {
      await deleteUser(currentUser.id)

    } catch (error) {
      showError(error.message)
    }
  }

  const handleSignout = async () => {
    try {
      localStorage.removeItem("token")
      dispatch(signoutSuccess())
    } catch (error) {
      showError(error.message)
    }
  }

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>

      <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>
        <input type="file" accept="image/*" onChange={handleImagechange} ref={filePickerRef} hidden />

        <div className="w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full" onClick={() => filePickerRef.current.click()}>
          <img
            src={imageFileUrl || getAvatarSrc(currentUser.profilePicture)}
            alt="user"
            referrerPolicy="no-referrer"
            className="rounded-full w-full h-full border-8 border-[lightgray] object-cover"
          />
        </div>

        <TextInput type="text" id="firstName" placeholder="First name" defaultValue={currentUser.firstName} />
        <TextInput type="text" id="lastName" placeholder="Last name" defaultValue={currentUser.lastName} />
        <TextInput type="text" id="username" placeholder="Username" defaultValue={currentUser.username} />
        <TextInput type="email" id="email" placeholder="Email" defaultValue={currentUser.email} />
        <TextInput type="password" id="password" placeholder="Password" />

        <Button type="submit" gradientDuoTone='purpleToBlue' outline disabled={loading}>{loading ? 'Loading...' : 'Update'}</Button>
      </form>

      <div className="text-red-500 flex justify-between mt-5">
        <span onClick={() => setShowModal(true)} className="cursor-pointer">Delete Account</span>
        <span onClick={handleSignout} className="cursor-pointer">Sign Out</span>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} popup size='md'>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">Are you sure you want to delete your account?</h3>

            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteUser}>
                Yes, I&apos;m sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>No, cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}

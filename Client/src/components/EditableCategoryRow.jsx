import { useState } from "react"
import { useError } from "../contexts/ErrorContext"
import { useSuccess } from "../contexts/SuccessContext"
import { Button, Modal, Table } from "flowbite-react"
import PropTypes from "prop-types"
import { HiOutlineCheck, HiOutlineX, HiOutlineExclamationCircle } from "react-icons/hi"
import { updateCategory, deleteCategory } from "../api/categoriesApi"

export default function EditableCategoryRow({ category, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(category.name)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { showError } = useError()
  const { showSuccess } = useSuccess()

  const handleSave = async () => {
    try {
      await updateCategory(category.id, newName)

      onSave(category.id, newName)
      setIsEditing(false)
      showSuccess('Category name updated successfully')
    } catch (error) {
      showError(error.message)
    }
  }

  const confirmDelete = async () => {
    setShowDeleteModal(false)

    try {
      await deleteCategory(category.id)
      
      onDelete(category.id)
      showSuccess("Category deleted successfully")
    } catch (err) {
      showError(err.message)
    }
  }

  return (
    <>
      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table.Cell>{new Date(category.createdAt).toLocaleDateString()}</Table.Cell>

        <Table.Cell>
          {isEditing ? (
            <div className="flex items-center">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="p-2 border rounded-md w-full"
              />
              <button onClick={handleSave} className="ml-2 text-green-500 hover:underline">
                <HiOutlineCheck className="text-2xl" />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setNewName(category.name)
                }}
                className="ml-2 text-red-500 hover:underline"
              >
                <HiOutlineX className="text-2xl" />
              </button>
            </div>
          ) : (
            <span
              onClick={() => setIsEditing(true)}
              className="font-medium text-gray-900 dark:text-white cursor-pointer"
            >
              {category.name}
            </span>
          )}
        </Table.Cell>

        <Table.Cell>
          <span
            onClick={() => setShowDeleteModal(true)}
            className="font-medium text-red-500 hover:underline cursor-pointer"
          >
            Delete
          </span>
        </Table.Cell>

        <Table.Cell>
          <span onClick={() => setIsEditing(true)} className="text-teal-500 hover:underline cursor-pointer">
            Change Name
          </span>
        </Table.Cell>
      </Table.Row>

      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} popup size="md">
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this category?
            </h3>

            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={confirmDelete}>
                Yes, I&apos;m sure
              </Button>
              <Button color="gray" onClick={() => setShowDeleteModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}

EditableCategoryRow.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}
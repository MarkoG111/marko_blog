import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useError } from '../contexts/ErrorContext'
import { getAllPublicCategories } from "../api/categoriesApi"

export default function Footer() {
  const [categories, setCategories] = useState([])

  const { showError } = useError()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllPublicCategories()

        setCategories(data.items)
      } catch (error) {
        showError(error.message)
      }
    }

    fetchCategories()
  }, [showError])

  return (
    <footer className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg pt-10 pb-5 md:p-20'>
      <ul className='flex items-center justify-center flex-wrap gap-6 md:mb-16 flex-col md:flex-row'>
        {categories && categories.length > 0 && categories.map((category) => (
          <li key={category.id}><Link to={`/category/${category.id}`}>{category.name}</Link></li>
        ))}
      </ul>
    </footer>
  )
}

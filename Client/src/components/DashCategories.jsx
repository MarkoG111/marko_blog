import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Table, Pagination } from "flowbite-react"
import { useError } from "../contexts/ErrorContext"
import EditableCategoryRow from "./EditableCategoryRow"
import { getCategoriesPaged } from "../api/categoriesApi";


export default function DashCategories() {
  const { currentUser } = useSelector((state) => state.user)
  const [categories, setCategories] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [loading, setLoading] = useState(true);

  const { showError } = useError()

  useEffect(() => {
    const fetchAdminCategories = async () => {
      try {
        setLoading(true);

        const data = await getCategoriesPaged(currentPage, 12);

        setCategories(data.items);
        setPageCount(data.pageCount);
      } catch (error) {
        showError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminCategories();
  }, [currentPage, showError]);

  const onPageChange = (page) => setCurrentPage(page)

  const handleSaveCategoryName = (id, updatedName) => {
    setCategories((prev) => prev.map((category) => category.id === id ? { ...category, name: updatedName } : category))
  }

  const handleDelete = (id) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  if (currentUser.roleName !== "Admin") {
    return <p>You are not allowed to view categories.</p>;
  }
  
  return (
    <div className="table-container-scrollbar table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Table hoverable className="shadow-md my-8">
            <Table.Head>
              <Table.HeadCell>Date updated</Table.HeadCell>
              <Table.HeadCell>Category name</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
              <Table.HeadCell>
                <span>Edit</span>
              </Table.HeadCell>
            </Table.Head>

            <Table.Body>
              {categories.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={4}>No categories found.</Table.Cell>
                </Table.Row>
              ) : (
                categories.map((category) => (
                  <EditableCategoryRow
                    key={category.id}
                    category={category}
                    onSave={handleSaveCategoryName}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </Table.Body>
          </Table>

          {pageCount > 1 && (
            <Pagination
              currentPage={currentPage}
              onPageChange={onPageChange}
              totalPages={pageCount}
              className="pb-6"
            />
          )}
        </>
      )}
    </div>
  );
}

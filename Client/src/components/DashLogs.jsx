import { useState, useEffect } from "react"
import { Button, Modal, Pagination, Table, TextInput, Spinner } from "flowbite-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { getUseCaseLogs } from "../api/useCaseLogsApi";

export default function DashLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState(null)

  const [selectedLog, setSelectedLog] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [filters, setFilters] = useState({
    actor: "",
    useCaseName: "",
    dateFrom: "",
    dateTo: "",
    page: 1,
    perPage: 40,
    sortOrder: "desc"
  })

  const columns = [
    { title: "Datetime", dataIndex: "date", sorter: true },
    { title: "Use Case Name", dataIndex: "useCaseName" },
    { title: "Actor", dataIndex: "actor" },
    { title: "Data", dataIndex: "data" },
    { title: "Actions", dataIndex: "actions" },
  ]

  useEffect(() => {
    fetchLogs()
  }, [filters])

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        ...(filters.actor && { Actor: filters.actor }),
        ...(filters.useCaseName && { UseCaseName: filters.useCaseName }),
        ...(filters.dateFrom && { DateFrom: new Date(filters.dateFrom).toISOString() }),
        ...(filters.dateTo && { DateTo: new Date(filters.dateTo).toISOString() }),
        Page: filters.page.toString(),
        PerPage: filters.perPage.toString(),
        SortOrder: filters.sortOrder
      })

      const data = await getUseCaseLogs(params.toString());

      setLogs(data.items)
      setTotal(data.totalCount)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleSort = () => {
    setFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === "asc" ? "desc" : "asc"
    }))
  }

  const openModal = (log) => {
    setSelectedLog(log)
    setIsModalOpen(true)
  }

  const closeModal = () => setIsModalOpen(false)

  const onPageChange = (page) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const totalPages = Math.ceil(total / filters.perPage)

  return (
    <div className="table-container-scrollbar table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {error && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <TextInput
          type="text"
          placeholder="Search Actor"
          value={filters.actor}
          onChange={(e) => setFilters(prev => ({ ...prev, actor: e.target.value, page: 1 }))}
        />
        <TextInput
          type="text"
          placeholder="Search Use Case"
          value={filters.useCaseName}
          onChange={(e) => setFilters(prev => ({ ...prev, useCaseName: e.target.value, page: 1 }))}
        />
        <div className="relative ml-20">
          <span>From: </span>
          <DatePicker
            selected={filters.dateFrom ? new Date(filters.dateFrom) : new Date()}
            onChange={(date) => setFilters(prev => ({
              ...prev,
              dateFrom: date ? date.toISOString().split("T")[0] : "",
              page: 1
            }))}
            dateFormat="MM/dd/yyyy"
            maxDate={new Date()}
            className="w-full border rounded-lg p-2 dark:bg-gray-700 cursor-pointer"
          />
        </div>
        <div className="relative">
          <span>To: </span>
          <DatePicker
            selected={filters.dateTo ? new Date(filters.dateTo) : new Date()}
            onChange={(date) => setFilters(prev => ({
              ...prev,
              dateTo: date ? date.toISOString().split("T")[0] : "",
              page: 1
            }))}
            dateFormat="MM/dd/yyyy"
            minDate={filters.dateFrom ? new Date(filters.dateFrom) : new Date()}
            className="w-full border rounded-lg p-2 dark:bg-gray-700 cursor-pointer"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="xl" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              {columns.map((column) => (
                <Table.HeadCell
                  key={column.dataIndex}
                  className={column.dataIndex === "date" ? "cursor-pointer" : ""}
                  onClick={() => column.dataIndex === "date" && toggleSort()}
                >
                  {column.title}
                  {column.dataIndex === "date" && (
                    <span className="ml-2 text-xl">
                      ( {filters.sortOrder === "asc" ? "↑" : "↓"} )
                    </span>
                  )}
                </Table.HeadCell>
              ))}
            </Table.Head>
            <Table.Body>
              {logs.map((log, index) => (
                <Table.Row key={log.id || `log-${index}`} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>{new Date(log.date).toLocaleString()}</Table.Cell>
                  <Table.Cell>{log.useCaseName}</Table.Cell>
                  <Table.Cell>{log.actor}</Table.Cell>
                  <Table.Cell>
                    <span title={log.data}>
                      {log.data.length > 70 ? `${log.data.substring(0, 70)}...` : log.data}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      gradientDuoTone="purpleToBlue"
                      onClick={() => openModal(log)}
                      size="sm"
                    >
                      View Details
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}

      <div className="flex justify-center mt-4">
        <Pagination
          currentPage={filters.page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          showIcons
        />
      </div>

      <Modal show={isModalOpen} onClose={closeModal}>
        <Modal.Header>Log Details</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Log Data (Parsed JSON)</h4>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                {selectedLog && JSON.stringify(selectedLog.data.replace(/[{}"]/g, '').replace(/,\s*/g, ', '), null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Full Log Info</h4>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                {selectedLog && JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
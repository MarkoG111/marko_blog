export default function PostCardSkeleton() {
    return (
        <div className="flex-1 min-w-[250px] w-full border h-[400px] rounded-lg sm:w-[430px] border-teal-500 overflow-hidden">
            {/* Slika placeholder */}
            <div className="m-4 h-[210px] rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />

            <div className="p-3 flex flex-col gap-3">
                {/* Naslov */}
                <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />

                {/* Kategorije */}
                <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />

                {/* Autor */}
                <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>
        </div>
    )
}
export default function SkeletonGrid(){
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6}).map((_, i) => (
                <div
                key = {i}
                className="animate-pulse bg-white border border-gray-200 rounded-xl p-4">
                    <div className="h-6 w-3/4 bg-gray-200 rounded mb-3" />
                    <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-5/6 bg-gray-200 rounded mb-6" />
                    <div className="h-3 w-1/3 bg-gray-200 rounded" />
                </div>
            ))}
        </div>
    )
}
import { ResourceExplorer } from "@/components/dashboard/ResourceExplorer";

export default function AdminLibraryPage() {
  return (
    <div>
      <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Library</h1>
            <p className="text-green-200 text-sm mt-0.5">
              Teaching resources and lesson plans
            </p>
          </div>
        </div>
      </div>
      <ResourceExplorer isAdmin={true} />
    </div>
  );
}

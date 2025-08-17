import PumpHouseRoaster from "./PumpHouseRoaster";

export default function UpdateRoaster() {
  return (
    <div className="relative z-10">
        {/* Heading */}
      <div className="bg-blue-100 bg-opacity-40 rounded-xl p-4 shadow-sm">
        <h2 className="text-2xl font-bold text-blue-800 mb-1">
          Over Head Tank Monthly Roaster
        </h2>
        <p className="text-sm text-gray-700">
          Manage monthly Distribution and Filling Roasters. Create, view, and save roaster records.
        </p>
        <p className="text-sm text-red-600 mt-1">
          Responses once saved cannot be edited again.
        </p>
      </div>
      <PumpHouseRoaster />
    </div>
  );
}

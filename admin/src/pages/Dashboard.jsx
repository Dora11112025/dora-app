export default function Dashboard() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Mirë se vini në Panelin e Administratorit</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-100 p-4 rounded">
          <h3 className="font-semibold">Profesionistë</h3>
          <p className="text-3xl">0</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded">
          <h3 className="font-semibold">Mesazhe të Flagged</h3>
          <p className="text-3xl">0</p>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <h3 className="font-semibold">Premium</h3>
          <p className="text-3xl">0</p>
        </div>
      </div>
    </div>
  )
}

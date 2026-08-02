export default function Navbar() {
  return (
    <nav className="w-full h-20 bg-slate-900 text-white flex items-center justify-between px-10">

      <h1 className="text-2xl font-bold">
        OneByte Steel Cabinets
      </h1>

      <div className="flex gap-8">

        <a href="#">Home</a>

        <a href="#">Products</a>

        <a href="#">Gallery</a>

        <a href="#">About</a>

        <a href="#">Contact</a>

      </div>

    </nav>
  );
}
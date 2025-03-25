export default function Footer() {
  return (
    <footer className="bg-gray-800 p-4 text-white text-center">
      <p>
        &copy; {new Date().getFullYear()} College Dashboard. All rights
        reserved.
      </p>
    </footer>
  );
}

import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import AppNavbar from "../component/AppNavbar";

export default function MainLayout() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AppNavbar />
      <main className="flex-grow-1 pb-4">
        <Container>
          <Outlet></Outlet>
        </Container>
      </main>
      <footer className="bg-white border-top py-3 text-center text-muted mt-auto">
        <Container>
          &copy; {new Date().getFullYear()} Develop By Andi Angga K.P
        </Container>
      </footer>
    </div>
  );
}

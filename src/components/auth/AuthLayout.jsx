import "../../styles/auth.css";

function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="auth-page">
      <div className="auth-background-text">TRIPWISE</div>

      <section className="auth-card">
        <div className="auth-heading">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {children}
      </section>
    </main>
  );
}

export default AuthLayout;

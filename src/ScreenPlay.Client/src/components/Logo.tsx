import logo from '../assets/logo.svg';

export default function LogoImage() {
  return (
    <img
      src={logo}
      alt="ScreenPlay Logo"
      style={{
        height: "100px", // Set the desired height
        width: "auto",   // Maintain aspect ratio
      }}
    />
  );
}
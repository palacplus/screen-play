import logo from '../assets/logo.svg';


const LogoImage: React.FC = () => {
  return (
    <div>
      <img src={logo} className="logo-image" />
    </div>
  );
};

export default LogoImage;
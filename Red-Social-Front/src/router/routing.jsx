
import { Routes, Route, BrowserRouter, Link } from "react-router-dom";
import { PublicLayout } from "../components/layout/public/PublicLayout";
import { Login } from "../components/user/Login";
import { Register } from "../components/user/Register";
import { PrivateLayout } from "../components/layout/private/PrivateLayout";
import { Feed } from "../components/publication/Feed";
import { AuthProvider } from "../context/AuthProvider";
import { Logout } from "../components/user/Logout";
import { People } from "../components/user/People";
import { Config } from "../components/user/Config";
import { Following } from "../components/follow/following";
import { Followers } from "../components/follow/followers";
import { Profile } from "../components/user/Profile";

export const Routing = () => {
  return (
    <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Login />} />
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Register />} />
        </Route>

        <Route path="/social" element={<PrivateLayout/>}>
         <Route index element={<Feed />} />
         <Route path="feed" element={<Feed />} />
         <Route path="logout" element={<Logout/>}></Route>
         <Route path="gente" element={<People/>}></Route>
         <Route path="ajustes" element={<Config/>}></Route>
         <Route path="siguiendo/:userId" element={<Following/>}></Route>
         <Route path="seguidores/:userId" element={<Followers/>}></Route>
         <Route path="perfil/:userId" element={<Profile/>}></Route>
        </Route>
         

        <Route path="*" element={
            <> 
            <p> <h1>Error 404</h1> 
            <Link to="/">Volver al inicio</Link></p>
            </>
           
        }/>



      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
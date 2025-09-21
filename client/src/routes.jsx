import App from "./components/App.jsx"
import AuthDebug from "./components/AuthDebug.jsx"
import LoginPage from "./components/Pages/LoginPage.jsx"
import PostPage from "./components/Pages/PostPage.jsx"
import RegisterPage from "./components/Pages/RegisterPage.jsx"

const routes = [
    {
        path: "/",
        element: <App />
    },
    {
        path: "/posts",
        element: <App />
    },
    {
        path: "*",
        element: <div>Not Found / 404</div>
    },
    {
        path: "/register",
        element: <RegisterPage/>
    },
    {
        path: "/posts/:postId",
        element:  <PostPage />
    },
    {
        path: "/login",
        element: <LoginPage/>
    }

]

export default routes
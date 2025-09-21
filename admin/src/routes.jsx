import App from "./components/App.jsx"
import CreateNewPost from "./components/Pages/CreateNewPost.jsx"
import LoginPage from "./components/Pages/LoginPage.jsx"
import RegisterPage from "./components/Pages/RegisterPage.jsx"
import AdminRoute from "./components/admin/AdminRoute.jsx"
import AdminHomePage from "./components/Pages/AdminHomePage.jsx"
import EditPostsList from "./components/Pages/EditPageList.jsx"
import EditPost from "./components/Pages/EditPost.jsx"

const routes = [
    {
        path: "/",
        element: <App />
    },
    {
        path: "/admin",
        element: <AdminRoute />,
        children: [
            { index: true, element: <AdminHomePage /> },
            { path: "posts/", element: <EditPostsList/>},
            { path: "posts/new", element: <CreateNewPost /> },
            { path: "posts/:postId/edit", element: <EditPost/>}
        ]
    },
    {
        path: "/admin/posts/new",
        element: <CreateNewPost/>
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
        path: "/login",
        element: <LoginPage/>
    }

]

export default routes
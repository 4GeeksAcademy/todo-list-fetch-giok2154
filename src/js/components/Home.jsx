import { TodoListFetch } from "../TodoListFetch.jsx";



// Create your first component
const Home = () => {
	// codigo JS
	// console.log('estoy dentro del componente Home')

	return (
		<div className="d-flex flex-column min-vh-100 text-center">	
			<TodoListFetch/>		
		</div>
	);
};

export default Home;
import { useAuthContext } from '../../contexts/auth'; 
import { KanbanView } from '../kanban/view';
import JobDataGrid from '../jobs/data-grid/data-grid';
import Dashboard  from '../dashboard';


const Root = () => {
    const { role } = useAuthContext(); 
    console.log(role)
    if (role === 'admin') {
        return <Dashboard />
    } 
    if (role === 'basic') {
        return <KanbanView />
    } 
    return <JobDataGrid />
}

export default Root
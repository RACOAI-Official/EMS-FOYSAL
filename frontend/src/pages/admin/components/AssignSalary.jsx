import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import HeaderSection from "../../../components/HeaderSection";
import { assignSalary, getEmployees, getLeaders } from "../../../http";
import "react-datepicker/dist/react-datepicker.css";


const AssignSalary = () =>
{
  const initialState = {salary:'',bonus:'', reasonForBonus:''}
  const [formData,setFormData] = useState(initialState);
  const [selectedEmployee, setSelectedEmployee] = useState();
  const [employees, setEmployees] = useState();

  const d = new Date();
  const [selectedYear, setSelectedYear] = useState(d.getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((d.getMonth() + 1).toString());

  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
  const months = [
    { name: 'January', value: 1 }, { name: 'February', value: 2 }, { name: 'March', value: 3 },
    { name: 'April', value: 4 }, { name: 'May', value: 5 }, { name: 'June', value: 6 },
    { name: 'July', value: 7 }, { name: 'August', value: 8 }, { name: 'September', value: 9 },
    { name: 'October', value: 10 }, { name: 'November', value: 11 }, { name: 'December', value: 12 }
  ];

  useEffect(() => {
    const fetchEmployees = async () => {
        const emps = await getEmployees();
        const leaders = await getLeaders();
        setEmployees([...emps.data,...leaders.data]);
    }
    fetchEmployees();

  },[]);

    const inputEvent = (e) =>
    {
        const {name,value} = e.target;
        setFormData((old)=>
        {
            return{
                ...old,
                [name]:value
            }

        })
    }

    const onSubmit = async (e) =>
    {
        e.preventDefault();
        const {salary} = formData;
        if(!salary) return toast.error('Salary Field Required');
        if(!selectedEmployee) return toast.error('Please select an employee');

        const submissionData = {
          ...formData,
          bonus: formData.bonus || 0,
          reasonForBonus: formData.reasonForBonus || 'N/A',
          employeeID: selectedEmployee,
          year: parseInt(selectedYear),
          month: parseInt(selectedMonth)
        };
        
        const res = await assignSalary(submissionData);
        if(res.success) {
          toast.success("Salary Assigned!");
          setFormData(initialState);
        } else {
          toast.error(res.message || "Failed to assign salary");
        }
    }

    return(
        <>
        <div className="main-content">
        <section className="section">
            <HeaderSection title='Salary'/>
                <div className="card">
                  <div className="card-body pr-5 pl-5 m-1">
                    <form className='row' onSubmit={onSubmit} id='addUserForm'>
                        
        <div className="form-group col-md-4">
        <label>Employees</label>  
          <select
            className='form-control select2'
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="">Employees</option>
            {employees?.map((employee) => (
              <option key={employee._id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group col-md-4">
          <label>Year</label>
          <select
            className='form-control select2'
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="form-group col-md-4">
          <label>Month</label>
          <select
            className='form-control select2'
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.name}</option>
            ))}
          </select>
        </div>

                        <div className="form-group col-md-4">
                            <label>Enter Salary</label>
                            <div className="input-group">
                                <div className="input-group-prepend">
                                <div className="input-group-text">
                                    <i className="fas fa-pen"></i>
                                </div>
                                </div>
                                <input onChange={inputEvent} value={formData.salary} type="number" id='salary' name='salary' className="form-control"/>
                            </div>
                        </div>

                        <div className="form-group col-md-4">
                            <label>Enter Bonus</label>
                            <div className="input-group">
                                <div className="input-group-prepend">
                                <div className="input-group-text">
                                    <i className="fas fa-pen"></i>
                                </div>
                                </div>
                                <input onChange={inputEvent} value={formData.bonus} type="number" id='bonus' name='bonus' className="form-control" placeholder="Optional"/>
                            </div>
                        </div>
                           

                        <div className="form-group col-md-12 ">
                            <label>Enter Reason</label>
                            <div className="input-group">
                                <div className="input-group-prepend">
                                <div className="input-group-text">
                                    <i className="fas fa-book"></i>
                                </div>
                                </div>
                                <input onChange={inputEvent} value={formData.reasonForBonus} type="text" id='reasonForBonus' name='reasonForBonus' className="form-control" placeholder="Optional"/>
                            </div>
                        </div>

                        <div className="form-group text-center col-md-12">
                            <button className='btn btn-primary btn-lg' type='submit' style={{width:'30vh'}}>Assign Salary</button>
                        </div>

                    </form>
                  </div>
                </div>
        </section>
      </div>
      </>
    )
}

export default AssignSalary;


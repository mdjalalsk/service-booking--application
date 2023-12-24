import { useMutation, useQuery } from '@tanstack/react-query';
import Container from '../components/ui/Container';
import useAuth from '../hooks/useAuth';
import { useState } from 'react';
import { useNavigate, useParams} from 'react-router-dom';

import useAxios from '../hooks/useAxios';
import toast from 'react-hot-toast';


const Booking = () => {
  const navigate=useNavigate();
const axios=useAxios();
  const { user } = useAuth();
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [address, setAddress] = useState('');
  
  //userParams is dynamic id for which service select booking
  const {id}=useParams();
  console.log(id);
  const {data:service,isLoading}=useQuery({
    queryKey:'booking',
    queryFn:async()=>{
    const res=await axios.get(`/services/${id}`)
    return res;
  },
})
console.log(service);
const serviceName=service?.data.title;
const servicePrice=service?.data.price;

const {mutate}=useMutation({
  mutationKey:'booking',
  mutationFn:(bookingData)=>{
    return axios.post('/create-bookings',bookingData)
  },
  onSuccess:()=>{
    toast.success("Booking successfully")
    navigate('/services');
  }
})

  // i used mutaion instad of handleSubmit 
  // const handleSubmit = (e) => {
  //   e.preventDefault();

  //   const data = { name, email, date, timeSlot, address };
  //   console.log(data);
  // };

  return (
    isLoading?<div className='text-center' ><span className="loading loading-ring loading-lg "></span>
    </div>:
    <Container className="my-40">
      <div className="flex">
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <img src={service?.data.img} alt="" />
            <h1 className="text-3xl font-bold">{service?.data.title}</h1>
            <p className="max-w-[60ch] text-xl mt-5">{service?.data.description}</p>
            <div className="space-y-4 mt-10">
              <h1 className='text-2xl font-bold'>Features:</h1>
            {service?.data.facility.map((item,index)=> <p className='text-red-600 text-lg font-semibold' key={index}>{item.name}</p>)}
              </div>
          </div>
          <div>
            <div className="divider max-w-2xl"></div>
            <p className="text-4xl font-semibold">
              {service?.data.price}$ <span className="text-xs">vat included</span>{' '}
            </p>
          </div>
        </div>
        <div className="card w-full max-w-md shadow-2xl bg-base-100">
          <form className="card-body" >
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                placeholder="name"
                className="input input-bordered"
                required
                onBlur={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="email"
                className="input input-bordered"
                required
                onBlur={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                required
                onBlur={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Time Slot</span>
              </label>
              <select
                className="input input-bordered"
                onChange={(e) => setTimeSlot(e.target.value)}
              >
                <option>8am. - 12pm.</option>
                <option>12pm. - 6pm.</option>
                <option>6pm. - 10pm.</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Address</span>
              </label>
              <textarea
                rows={12}
                className="input input-bordered"
                onBlur={(e) => setAddress(e.target.value)}
              ></textarea>
            </div>

            <div className="form-control mt-2">
              <button type='button' className="btn btn-primary" onClick={()=>mutate({customerName,email,date,timeSlot,address,servicePrice,serviceName,status:'pending'})}>Book</button>
            </div>
          </form>
        </div>
      </div>
    </Container>
  );
};

export default Booking;

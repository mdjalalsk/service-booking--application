import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import { auth } from "../config/firebase.config";
import Container from "../components/ui/Container";
import toast from "react-hot-toast";
const TrackOrder = () => {
 const queryClient=useQueryClient();
  const axios=useAxios();
//create booking 
  const userEmail=auth?.currentUser?.email;
   console.log(userEmail);
  const {data:bookings,isLoading}=useQuery({
    queryKey:["booking"],
    queryFn: async() =>{
    const res=await axios.get(`/user/bookings?email=${userEmail}`);
    return res;
    }
  })
  console.log(bookings?.data);

// delete booking
const {mutate}=useMutation({
  mutationKey:["booking"],
  mutationFn: async(id) =>{
    const res=await axios.delete(`/bookings/${id}`);
    return res;
  },
  onSuccess:()=>{
    toast.success("Booking deleted successfully")
    queryClient.invalidateQueries({queryKey:["booking"]})
  }
})

  return (
    isLoading?<div className='text-center' ><span className="loading loading-ring loading-lg "></span>
    </div>:
    <Container>
            <h1 className="text-center text-3xl text-primary font-bold mt-6">TrackOrder</h1>
  <div className="overflow-x-auto my-5">
  <table className="table border-2 border-red-300">
    {/* head */}
    <thead>
      <tr className="border-bottom-2 border-gray-500">
        <th></th>
        <th>Service Name</th>
        <th>Customer Name</th>
        <th>Address</th>
        <th>Date</th>
        <th>Time Slot</th>
        <th>Price</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
    {
     
    bookings?.data?.map((booking,index) => (
    <tr className="border-bottom-2 border-gray-500" key={booking.id}>
      <th>{index+1}</th>
      <td>{booking.serviceName}</td>
      <td>{booking.customerName}</td>
      <td>{booking.address}</td>
      <td>{booking.date}</td>
      <td>{booking.timeSlot}</td>  
     <td>{booking?.servicePrice ?? 0}$</td>
      <td>{booking.status}</td>
      <td>Edit | <button onClick={()=>mutate(booking?._id)} className="btn">
cancel</button></td>
    </tr>
  ))
}
   
    </tbody>
  </table>
</div>
          
    </Container>
  
  );
};

export default TrackOrder;

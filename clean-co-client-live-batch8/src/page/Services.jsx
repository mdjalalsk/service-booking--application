import Header from '../components/ui/Header';
import Container from '../components/ui/Container';
import { useQuery } from '@tanstack/react-query';
import useAxios from '../hooks/useAxios';
import ServiceCard from '../components/ServiceCard';
import { useEffect, useState } from 'react';
import { number } from 'prop-types';
// import { useState } from 'react';

const Services = () => {
  const axios=useAxios();
  // const [services, setServices] = useState([]);
  const [price,setPrice] = useState('');
  const [category,setCategory] = useState('');
  const [page,setPage] = useState(1);
const[limit,setLimit] = useState(5);
  // const limit=5;
/*###### start make categories from title ######*/
 const [makeCategory,SetMakeCategory] = useState(['']);
 useEffect(() => {
  axios.get('/services')
  .then(res=>{
    const data= res.data.result;
    SetMakeCategory(data);
   },[])
 })
 let categories=[];
 if(makeCategory){
   let titles =  makeCategory.map(item => item.title);
   titles.forEach(item => {
     if (!categories.includes(item)) {
       categories.push(item);
     }
   });    
 }

/*###### end make categories from title ######*/
    const getServices=async()=>{
      const res=await axios.get(`/services?sortFiled=price&sortOrder=${price}&title=${category}&page=${page}&limit=${limit}`)
      return res;
    }
  const  query=useQuery({
     queryKey:['services',price,category,page,limit],
   queryFn: getServices
  })
    const {data:services,isLoading,isError,error}=query; 
  
   /*###### start pagination ######*/
   
   const totalData=Number(services?.data?.total);
   const totalPages=Math.ceil(totalData/limit);
   console.log(totalPages)
   const handlePrevious=()=>{
     if(page>1){
      setPage(page-1)
     }
   }
   const handleNext=()=>{
    if(page<totalPages){
      setPage(page+1)
    }
    
   }
   /*###### end pagination ######*/

         
  return (
     isLoading?<div className='text-center' ><span className="loading loading-ring loading-lg "></span>
     </div>:
      <>
      <Container className="mt-10">
        <Header title="Services">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptate
          nobis excepturi delectus, ab id provident, voluptas iste ullam
          repellendus animi eos perspiciatis cumque. Quod sit laboriosam
          deleniti atque explicabo esse.
        </Header>
   
      </Container>
      <Container className="mb-40">
        <div className='flex justify-between p-3 my-9 border-2 border-purple-700 items-center'>
              <div >
                  <p className='text-xl'>Over {services?.data?.total} service to choose from </p>
              </div>
            <div className='flex gap-5'>
                <div className='text-center'>

                   <label className='text-xl font-bold'>Category</label>
                      <select className="select select-bordered select-lg w-full max-w-xs" value={category} onChange={(e)=>{setCategory(e.target.value)}}>
                            <option disabled selected>Choose one</option>
                            <option value={''}>All</option>

                            {
                              categories.map((item,index )=> <option key={index} value={item}>{item}</option>)
                            }
                             </select>
                   </div>
                   <div className='text-center'>
                   <label className='text-xl font-bold'>Price</label>
                      <select className="select select-bordered select-lg w-full max-w-xs" value={price} onChange={(e)=>setPrice(e.target.value)}>
                            <option disabled selected>Choose one</option>
                            <option value="asc">From Low to High</option>
                            <option value="desc">From High to Low</option>
                      
                      </select>
                   </div>
             </div>
        </div>
        <div className="grid grid-cols-3 gap-10">
          {/* Service Cards goes here */}
          {
           
           isLoading?<div className='text-center' ><span className="loading loading-ring loading-lg "></span>
           </div>: services?.data?.result?.map(service=><ServiceCard key={service._id} service={service}></ServiceCard>)
          }
        </div>
      </Container>
      <Container className="mb-10 flex justify-end items-center gap-x-4">
              <div className='flex items-center gap-2'>
                <label className='text-lg text-cyan-500 font-semibold'>Show par page</label>
              <select  className="select select-bordered" value={limit} name=""onChange={(e)=>setLimit(e.target.value)}>
               <option disabled selected>Choose one</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                </select>
              </div>
        <div className="join">
            <button className="join-item btn" onClick={handlePrevious}>Previous</button>
          
            {
               
              Array(totalPages).fill(0).map((item, index) =>{
                const pageNumber=index+1;
                return <button className={`${pageNumber==page?'join-item btn btn-primary':'join-item btn btn-ghost'}`} key={pageNumber} onClick={()=>setPage(pageNumber)}>{pageNumber}</button>
              }
               
              )
            }

            <button className="join-item btn" onClick={handleNext}>next</button>
       </div> 
        </Container>
   
  

     
    </>
  );
};

export default Services;

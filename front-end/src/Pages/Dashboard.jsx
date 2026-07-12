import React, { useState,useEffect } from 'react';
import MarksTable from './Marks';
import RadarChart from './Chart';


const Dashboard = () => {
  // Sample data (Replace this with your data)
  const data =  localStorage.getItem('final-data');
  // Guard against a missing / unparseable result so the dashboard never crashes
  // (e.g. a logged-in user who lands here before finishing an interview).
  let parseData = {};
  try {
    parseData = JSON.parse(data) || {};
  } catch {
    parseData = {};
  }
  // console.log(parseData)
  // console.log(parseData.TechnicalKnowledge)
  useEffect(() => {
    // Get data from localStorage
    //const storedData = localStorage.getItem('final-data');
    //setData(storedData);
  }, []);
  
  

  const [marksData, setMarksData] = useState([
    { id: 1, subject: 'CommunicationSkills', marks: parseData.CommunicationSkills?parseData.CommunicationSkills:0},
    { id: 2, subject: 'CriticalThinking', marks: parseData.CriticalThinking?parseData.CriticalThinking:0 },
    { id: 3, subject: 'ProblemSolving', marks: parseData.ProblemSolving?parseData.ProblemSolving:0 },
    { id: 4, subject: 'TechnicalKnowledge', marks: parseData.TechnicalKnowledge?parseData.TechnicalKnowledge:0 },
    { id: 5, subject: 'UoF', marks: parseData.UoF?parseData.UoF:0 },
   
  ]);

  return (
    
    <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)"}}>
        <div style={{width:"70%",margin:"auto"}}>
        <MarksTable data={marksData} />
        </div>
        <div style={{marginTop:"-5%"}}>
        <RadarChart/>
        </div>
    </div>
  );
};

export default Dashboard;

// CommunicationSkills
// : 
// 4
// CriticalThinking
// : 
// 6
// ProblemSolving
// : 
// 5
// TechnicalKnowledge
// : 
// 6
// UoF
// : 
// 7
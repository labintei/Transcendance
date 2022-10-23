import { stripBasename } from '@remix-run/router';
import { throws } from 'assert';
import React, {useState, useEffect, useRef} from 'react';
//import { useState , useEffect } from 'react';
import axios from 'axios';
import './labintei.css';
//import userEvent from '@testing-library/user-event';
//import { Console } from 'console';
//import { isThrowStatement } from 'typescript';
//import {ReactDOM} from 'react-dom/client';


type user_c =
  {
    username: string;
    ft_login: string;
  }

  const dflt:user_c = {username: "dflt", ft_login: "dflt"};


  type State = {
    username:string;
    ft_login:string;

    user:user_c
    nameEdit:boolean
    query:string
    query2:File | null
    avatarEdit:boolean
    bgChoice:number
  }

  // state:State={username: '' , ft_login: "", user:dflt, nameEdit:false, avatarEdit:false, query:'', query2:null, bgChoice:0};

export default class Labintei extends React.Component<{}, {value: string}>{
/*
  constructor(props:any) {
    super(props);
    // declare a new state variable 
    const [usernameu, setName] = useState<string>('');
    const SetnameRef = useRef<string>();

    SetnameRef.current = usernameu;

    this.handleSubmit = this.handleSubmit.bind(this);
  }*/


  constructor(props:any) {
  
  super(props);
//    peut declarer son state de cette facon

    /*
    this.state = {
        comments: DataSource.getComments(),  
        name: "ddweww"
        ...
    }*/
    
    
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }


  Createusername(s:string){
    axios.get('http://localhost:3000/user');
    axios.get(url[,config])
    // peut creer de nouvelle instance avec axions
    /*...*/

    const i = axios.create({
      baseURL: 'http://localhost:3000/user',
      p: 'fffff'
    })
  }
  
  handleChange(event:any)
  {    this.setState({value: event.target.value});  
        console.log(event.target.value);
  }

  handleSubmit(event:any)
  {
    alert('A name was submitted: ' + this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  
 /*
    render() {
      return (
        <form onSubmit={this.handleSubmit}>
          <label>
            Name:
            <input type="text" value={this.state.value} onChange={this.SetName({usernameu: this.state.value})} />
          </label>
          <input type="submit" value="Submit" />
        </form>
      );
   */ 
  
  }


  /*
  changeHandler = event => {
    const username = event.target.username;
    const ft_login = event.target.ft_login;
    this.setState({
      formControls: {
        ...this.state.formControls,
        [username]: {
        ...this.state.formControls[username],
        ft_login
      }
    }
  });


  render() {
    return (
      <form>
      <input type="string"
              name="username"
              value={this.state.username}
              onChange={this.changeHandler}
      />
      <input type="string"
              name="ft_login"
              value={this.state.ft_login}
              onChange={this.changeHandler}
      />
      </form>
    )
  }*/
}



// Intersting icon
//https://www.iconfinder.com/icons/103676/path_icon
/*
const MyComp = (props) => {
  const [name, setName] = useState<string>('mounji')
  const [var, setVar] = useState<any>([])

  


  useEffect(() =>{
    const fetch = async () => {
        const result = await fetch("goofle.fr")
        setVar(result)
    }
    
    fetch()
  },[var])


  return (
    <form onSubmit={this.handleSubmit}>
      <label>
        Name: {var}
        <input type="text" value={name} onChange={setName(name)} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
}


this.setState({this.state.myvar: this.state.myvar + 1})

setVar(var + 1)*/
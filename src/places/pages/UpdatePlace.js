import React,{useEffect,useState,useContext} from 'react';
import {useParams,useHistory} from 'react-router-dom';

import './PlaceForm.css';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import {VALIDATOR_REQUIRE,VALIDATOR_MINLENGTH} from '../../shared/components/util/Validators'
import {useForm} from '../../shared/hooks/form-hook';
import Card from '../../shared/components/UIEelements/Card'
import {useHttpClient} from '../../shared/hooks/http-hook';
import LoadingSpinner from '../../shared/components/UIEelements/LoadingSpinner'
import ErrorModal from '../../shared/components/UIEelements/ErrorModal'
import AuthContext from '../../shared/context/auth-context'

  const UpdatePlace = () => {

    const auth= useContext(AuthContext);

    const history=useHistory();

    const {isLoading,error,sendRequest,clearError}=useHttpClient();

    const [loadedPlace,setLoadedPlace]=useState();

    const placeId = useParams().placeId;
  
    const [formState, inputHandler,setFormData] = useForm(
      {
        title: {
          value: '',
          isValid: false
        },
        description: {
          value: '',
          isValid: false
        }
      },
      false
    );
      
      useEffect( 
          ()=>{
            const fetchPlace = async ()=>{
              try{
                const responseData = await sendRequest(`http://localhost:5000/api/places/${placeId}`);
                setLoadedPlace(responseData.place);
                setFormData({
                  title: {
                    value: responseData.place.title,
                    isValid: true
                  },
                  description: {
                    value: responseData.place.description,
                    isValid: true
                  }
                },true)
              }catch(err){

              }
          }
          fetchPlace();
        }
      ,[sendRequest,placeId,setFormData])
  
    const placeUpdateSubmitHandler = async event => {
      event.preventDefault();
      try{
        await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`,
          'PATCH',
          JSON.stringify({
            title :formState.inputs.title.value,
            description:formState.inputs.description.value
          }),{
            "Content-Type": "application/json",
            Authorization:'Bearer '+auth.token
          }
        )
        history.push('/'+auth.userId+'/places');
      }catch(err){

      }
    };
  
    if (!loadedPlace && !error) {
      return (
        <div className="center">
          <Card>Could not find place!</Card>
        </div>
      );
    }
  
    if(isLoading){
      return (
        <div className="center">
            <LoadingSpinner/>
        </div>
      );
    }

    return (
      <React.Fragment>
        <ErrorModal error={error} onClear={clearError}/>
        {!isLoading && loadedPlace && <form className="place-form" onSubmit={placeUpdateSubmitHandler}>
          <Input
            id="title"
            element="input"
            type="text"
            label="Title"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid title."
            onInput={inputHandler}
            initialValue={loadedPlace.title}
            initialValid={true}
          />
          <Input
            id="description"
            element="textarea"
            label="Description"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please enter a valid description (min. 5 characters)."
            onInput={inputHandler}
            initialValue={loadedPlace.description}
            initialValid={true}
          />
          <Button type="submit" disabled={!formState.isValid}>
            UPDATE PLACE
          </Button>
        </form>}
      </React.Fragment>
    );
  };
  
  export default UpdatePlace;
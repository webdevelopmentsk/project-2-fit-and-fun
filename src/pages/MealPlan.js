import React, {useEffect} from 'react';

//Routers
import {Switch, Route} from 'react-router-dom';

import CaloriesRemain from '../components/molecules/CaloriesRemain';
import SearchRecipe from '../components/organisms/SearchRecipe';
import Header from '../components/organisms/Header';
import FavoriteRecipe from '../components/organisms/FavoriteRecipe';
import SuggestedRecipe from '../components/organisms/SuggestedRecipe';
import FoodDiary from '../components/organisms/FoodDiary';

//data
import { content } from '../data/content';
import { routesRecipeBar } from '../data/routes';
//context
import { Context } from '../context/Provider';

//apis
import edamam from '../apis/edamam';
import clientFood from '../apis/client'; 

//import axios from 'axios';

const MealPlan = () => {

  const content_mealPlan = content.mealPlan;
  const {state,changeState,change2State} = React.useContext(Context);

const addItem = (item,type) => {
  let newList = [...state[type],item];
  changeState(type,newList)
};     
const deleteItem = (item,type)=> {        
  let index = state[type].indexOf(item);
  let newList = [...state[type]];
  newList.splice(index,1);
  changeState(type,newList);
};

const deleteItemFavRecipe = (index,type) => {
  let newList = [...state[type]];
  newList.splice(index,1);
  changeState(type,newList);
};

const onChangeItem = (item,type) =>{

    if(type=== 'favoriteRecipes'){
          let value = false;
          let index = -1;
          state.favoriteRecipes.map((obj,idx) => {
            if(obj.recipe.url === item.recipe.url)
            {value = true;index=idx;}
            return null;
          });

          if (value){
            deleteItemFavRecipe(index,type);
          }
          else{
            addItem(item,type)
          }
          
      }
      else{
        let index = state[type].indexOf(item);
        index > -1 ? deleteItem(item,type) : addItem(item,type);
      }

};

const checkFavoriteRecipe = item => {
  let isLiked = false;

  state.favoriteRecipes.length > 0 && state.favoriteRecipes.map(
    obj => { 
      if(obj.recipe.url === item.recipe.url) 
      {
        isLiked = true;
      } return isLiked;}
  );

  return isLiked;
}

//CalTotalCalories from Food
useEffect(()=>{
  let totalCal = 0;
  state.breakfast.forEach(food => {
    let itemCal = Math.round(food.recipe.calories/food.recipe.yield);
    totalCal = totalCal + itemCal;
  })
  state.lunch.forEach(food => {
    let itemCal = Math.round(food.recipe.calories/food.recipe.yield);
    totalCal = totalCal + itemCal;
  })
  state.dinner.forEach(food => {
    let itemCal = Math.round(food.recipe.calories/food.recipe.yield);
    totalCal = totalCal + itemCal;
  })
  state.snacks.forEach(food => {
    let itemCal = Math.round(food.recipe.calories/food.recipe.yield);
    totalCal = totalCal + itemCal;
  })

  let data = state.calTrack;
  data.foodTotalCal = totalCal;
  changeState('calTrack',data);


},[state.breakfast,state.lunch,state.dinner,state.snacks]);

const onClickSearchRecipe = async() => {

    if(!state.ingredients && state.meals && state.foodPreferences) 
    { return content_mealPlan.searchRecipe.errors.noSearchOption}

    const response = await edamam.get('/search', 
    {
      params: {
        q: state.ingredients.join('+')
      },
    });
    response.data.hits && changeState('recipes',response.data.hits);

};

const onSelectMealPlan = async(item,type) =>{
  await changeState(type,item)
  console.log(item.parameter)
  switch(item.parameter){
    case 'diet':{
       const response = await edamam.get('/search', 
      {
        params: {
          q: state.randomIngredients.join('+')
        },
      });
      response.data.hits && changeState('mealPlanRecipes',response.data.hits);
    };break;
    default:break;
  }
}

const onUserFoodItemAdded = async(item) =>{

  const foods = await clientFood.search({ query: item });
  let list=[];
  for(let i=0; i<= 3; i++){list.push(foods.hints[i])}
  let constructedList = [];
  list.map(item =>{
    let data = {
        recipe:{
            label:'',
            calories: '',
            yield:1
        }
    };
    data.recipe.label = item.food.label;
    data.recipe.calories = Math.round(item.food.nutrients.ENERC_KCAL)
    constructedList.push(data)
  })
  changeState('userFoodItems',constructedList)
};

const onClickSelectFoodItem = async (item,type) =>{
  let newList = [...state[type],item];
  change2State(type,newList)
};
  return <>
            <CaloriesRemain />
            <FoodDiary 
              content = {content_mealPlan}
              state ={state}
              deleteItem ={deleteItem}
              isItemObject = {true}
              onUserFoodItemAdded = {onUserFoodItemAdded}
              searchItemType = 'userFoodItems'
              onClickSelectFoodItem ={onClickSelectFoodItem} 
            />
            <Header routes ={routesRecipeBar} />
              <Switch>
                  <Route
                    path="/mealplan/suggestedrecipes"
                    //component={SuggestedRecipe}
                  >
                    <SuggestedRecipe 
                      state ={state}
                      content = {content_mealPlan}
                      onSelectMealPlan = {onSelectMealPlan}
                      onChangeItem = {onChangeItem}
                      checkFavoriteRecipe = {checkFavoriteRecipe}
                      onClickIconAddFoodRecipe ={addItem}
                    />
                  </Route>
                  <Route
                    path="/mealplan/searchrecipes"
                    //component ={SearchRecipe}
                  >              
                    <SearchRecipe
                    content = {content_mealPlan}
                    state ={state}
                    onClickSearchRecipe = {onClickSearchRecipe} 
                    isItemObject = {false}
                    onChangeItem ={onChangeItem}
                    addItem = {addItem}
                    deleteItem ={deleteItem}
                    checkFavoriteRecipe = {checkFavoriteRecipe} 
                    onClickIconAddFoodRecipe ={addItem} 
                    type = {content_mealPlan.searchRecipe.type}/>
                  </Route>
                  <Route
                    path="/mealplan/favoriterecipes"
                    //component ={FavoriteRecipe}
                  >
                    {state.favoriteRecipes && 
                    <FavoriteRecipe 
                    content = {content_mealPlan}
                    state ={state}
                    onChangeItem ={onChangeItem}
                    checkFavoriteRecipe ={checkFavoriteRecipe}
                    onClickIconAddFoodRecipe ={addItem}
                    />}
                  </Route>
              </Switch>

        </>
}

export default MealPlan;



    /*
    const searchTerm_ingredients =  `q=${state.ingredients.join('+')}`;
    const searchTerm_meal =  "";
    const diet = "balanced"

    const apiURL = "https://api.edamam.com/search?";
    const apiKey = "b6862d92194b7d072c3230c20a3dbed1";
    const apiId = "11d90389";

    const url = `${apiURL}${searchTerm_ingredients}${apiId}${apiKey}`

    const response = await axios.get(url);
    console.log(response.data.hits)

    //const maxTime = "&time=30";
    //const maxIngreds = `&ingr=15`;
    */

    /*
      const addItem = (item,type) => {
    let newList = [...state[type],item]; 
    changeState(type,newList)
  };

  const deleteItem = (item,type) => {
        console.log(item + " " + type)
        let index = state[type].indexOf(item)
        let newList = [...state[type]]
        newList.splice(index,1)
        changeState(type,newList)
  };

  const onChangeItem = (item,type) =>{
    let index = state[type].indexOf(item)
    index > -1 ? deleteItem(item,type) : addItem(item,type)
  };
  */
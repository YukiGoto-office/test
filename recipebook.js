/* jshint curly:true, debug:true */
/* globals $, firebase */

// ログイン状態の変化を監視する
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log('ログインしました');
    } else {
      console.log('ログインしていません');
  
      firebase
        .auth()
        .signInAnonymously() // 匿名ログインの実行
        .catch((error) => {
          // ログインに失敗したときの処理
          console.error('ログインエラー', error);
        });
    }
});

$(document).on('change',`#img-input`, function (e) {
    alert(`画像がアップロードされました`);
    var reader = new FileReader();
    reader.onload = function (e) {
        $("#preview").attr('src', e.target.result);
    }
    reader.readAsDataURL(e.target.files[0]);
});



const resetNo = ()=> {
    for( i=0; i< $(`.step-no`).length; i++){
        $(`.step-no`).eq(i).text(i);
    };
};

//テーブル行のドラッグアンドドロップ
$(function(){
    $('#sort-ingredientsdata').sortable();
});

$(function(){
    $('#sort-stepdata').sortable({
        update: ()=>{
            resetNo();
        }
    });
});

$(document).on(`click`, `.delete-row`,(e) => {
    console.log(`列を削除します`);
    $(e.target).parent().parent().remove();
});

$(document).on(`click`, `.reset-no`,(e) => {
    console.log(`列番号をリセットします。`);
    resetNo();

});


$(document).on(`click`,`#recipe-regist`,()=>{
    //レシピ名取得
    const recipeTitle =$(`#recipe-title`).val();
    console.log(recipeTitle);

    //画像取得
    const {files}=$(`#img-input`)[0];
    if(files.length === 0){
        return;
    }
    
    const file = files[0];
    const filename = file.name;
    const ImageLocation = `recipe-images/${filename}`;

        //storageへ画像登録
    firebase
        .storage()
        .ref(ImageLocation)
        .put(file)


    //食材取得
    ingredientArray = $(`.ingredients-input`);
    foodamountArray = $(`.food-amount-input`);
    let ingredients = [];
    for(let i=1; i<= ingredientArray.length-1; i++){
        ingredients[i-1] = {};
        ingredients[i-1].name = ingredientArray[i].value;
        ingredients[i-1].amount= foodamountArray[i].value;
    }

    //作り方取得
    const stepArray=$(`.step-input`);
    let steps = [];
    for(let i=1; i< stepArray.length; i++){
        steps[i-1] = stepArray[i].value
    }
    console.log(steps);
    
    const recipeData = {
        recipeTitle,
        ingredients,
        steps,
        ImageLocation,
    };

    console.log(recipeData);

    //firebase　DB登録

    recipeId = firebase
            .database()
            .ref(`recipes`)
            .push()
            .key;
        
    firebase
        .database()
        .ref(`recipes/${recipeId}`)
        .set(recipeData);

    const categoryId= $(`[name=category]`).val();

    ref = firebase
            .database()
            .ref(`category/${categoryId}/list`)
    ref.once(`value`,(snapshot)=> {
        addid= snapshot.val();
        if(addid==null){
            ref.set([recipeId]);
        }else{
            addid.push(recipeId);
            ref.set(addid);
            console.log(addid)
        }
    });
});
    /*categoryData={
        name:categoryName,
        list:[recipeId],
    }*/
    
    /*firebase
        .database()
        .ref(`category`)
        .once(`value`, (snapshot)=> {
            //それぞれ配列に入れてindexOfで検索
            //なければcategoryDataを新規登録
            //あればcategoryのlistを更新
            var categoryArray = [];
            var idArray = [];
            snapshot.forEach((id)=>{
                categoryArray.push(id.val().name);
                idArray.push(id.key);
            })
            console.log(categoryArray);
            console.log(idArray);

            const result= categoryArray.indexOf(categoryName);
            if(result== -1){
                console.log(`カテゴリがありません`);
                console.log(`新規作成します`);
                categoryId = firebase
                                .database()
                                .ref(`category`)
                                .push()
                                .key;

                firebase
                    .database()
                    .ref(`category/${categoryId}`)
                    .set(categoryData);
            }else{
                console.log(idArray[result]);
                categoryId = idArray[result];
                ref = firebase
                        .database()
                        .ref(`category/${categoryId}/list`)
                ref.once(`value`,(snapshot)=> {
                addid= snapshot.val();
                addid.push(recipeId);
                ref.set(addid);
                console.log(addid);
                })
            }
    });*/  


Vue.component(`button-delete`, {
    template: `
    <button type="button" class="btn btn-secondary btn-sm delete-row">&#10005;</button>
    `,
});


Vue.component(`tr-ingredients`,{
    template:`
    <tr>
        <td class="ingredients"><input type="text" class="ingredients-input"></td>
        <td class="food-amount"><input type="text" class="food-amount-input"></td>
        <td><button-delete></button-delete></td>
    </tr>
    `
}),
    

Vue.component(`button-add-row`, {
    template:`
    <button type="button" class ="btn btn-secondary add-row">行の追加</button>
    `,
});

        /*firebase
            .database()
            .ref(`category`)
            .on(`value`,(snapshot)=>{
                snapshot.forEach((id)=>{
                    this.categoryIds.push(id.key);
                    this.categoryNames.push(id.val().name);
                });
            //console.log(this.categoryIds);
            //console.log(this.categoryNames);
            });
        */




new Vue({
    el:`#bodycontent`,
    data: {
         
        ingredients:{},
        steps:[],
        categoryIds: [],
        categoryNames: [],
        recipeNameObj:{},
        practiceObj:{},
    
    },

    created (){
        firebase
            .database()
            .ref(`recipes/-MDd0mLX3Ieb9YEP4LKB`)
            .on(`value`,(snapshot) =>{
                this.ingredients = snapshot.val().ingredients;
                this.steps = snapshot.val().step;
                //console.log(this.ingredients);
                //console.log(this.steps);
            }); 
            
        firebase
            .database()
            .ref(`category`)
            .on(`value`,(snapshot)=>{
                this.categoryIds = Object.keys(snapshot.val()).map((id)=>{
                    return id;
                });
                this.categoryNames = Object.values(snapshot.val()).map((id)=>{
                    return id.name;
                });
                //console.log(this.categoryIds);
                //console.log(this.categoryNames);
                this.categoryIds.forEach((categoryId)=>{
                    firebase
                        .database()
                        .ref(`category/${categoryId}/list`)
                        .on(`value`,(snapshot)=>{
                            //console.log(snapshot.val());
                            if(snapshot.val()!==null){                               
                                recipeIds = snapshot.val();
                                
                                recipeIds.forEach((recipeId)=>{
                                    firebase.database().ref(`recipes/${recipeId}`).once(`value`,(snapshot)=>{
                                        count = 1;
                                        if(snapshot.val()!==null){
                                            recipeName = snapshot.val().recipeTitle;
                                            //console.log(recipeName);
                                            this.recipeNameObj[categoryId]={
                                                [recipeId]:recipeName,
                                            };
                                        /*}else if(snapshot.val() === null){
                                            console.log(snapshot.val());
                                            recipeId = `id${count}`;
                                            recipeName = `Name${count}`
                                            this.recipeNameObj[categoryId]={
                                                [recipeId]:recipeName,
                                            };
                                            count ++;*/
                                        }
                                    });
                                });
                            }
                        });
                });
                //meat = this.categoryIds[1];
                //console.log(meat);
                console.dir(this.recipeNameObj);
                targetObj = this.recipeNameObj;
                targetArray = this.categoryIds;
                //console.log(JSON.parse(JSON.stringify(this.recipeNameObj[`-ME2wq2NHnMNZFs8I5Nw`])));
                //this.practiceObj[`-obj1`] = {name:`名前1`};
                //this.practiceObj[`-obj2`] = {name:`名前2`};
                //console.dir(this.practiceObj);
                //console.log(this.practiceObj[`-obj1`]);
            });
    //},

    //mounted(){
        /*console.log(this.categoryIds);
        this.categoryIds.forEach((categoryId)=>{
            firebase
                .database()
                .ref(`category/${categoryId}/list`)
                .once(`value`,(snapshot)=>{
                    recipeIds = snapshot.val();
                    recipeIds.forEach((recipeId)=>{
                        firebase.database().ref(`recipes/${recipeId}`).once(`value`,(snapshot)=>{
                            recipeName = snapshot.val().recipeTitle;
                            this.recipeNameObj[categoryId].push({
                                recipeId:recipeName,
                            });
                        });
                    });
                });
            console.log(this.recipenameObj);
        });*/
    },    
    

    methods:{
        addIngredients: ()=>{
            
            const addrow = $(`#ingredients-template`).clone().removeAttr(`id class`);
            $(`#ingredients-table`).children().last().append(addrow);

        },

        addStep: ()=>{

            const prevNo = parseFloat($(`.step-no`).last().text());
            const stepNo = prevNo + 1 ;
            const addrow = $(`#step-template`).clone().removeAttr(`id class`);
            $(`#step-table`).children().append(addrow);
            $(`.step-no`).last().text(stepNo);
        },

    },
});



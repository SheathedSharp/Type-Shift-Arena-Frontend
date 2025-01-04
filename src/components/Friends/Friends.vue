<template>
   <div class="friend">
        <div class="my">
          <div class="my-info">
            <a-avatar  :src="userInfo.avatarUrl" :size="50">
              <template #icon><UserOutlined /></template>
            </a-avatar>
            <span>{{ userInfo.nickname }}</span>
          </div>
          <div class="search-btn" @click="isSearch=!isSearch">
            <user-add-outlined />
          </div>
        </div>

        <div class="firend-list">
          <div class="list-items" v-for="item in friendsList " :key="item.id">
              <a-avatar 
                class="items-avatar"      
                :src="item.imgUrl"
                :size="50"
              >
                <user-outlined />
              </a-avatar>
              <span>{{item.name}}</span>
              <div class="inv-btn" @click="invToGame(item.id)">
                <plus-outlined />
              </div>
            </div>
        </div>
      </div> 
      <teleport to="body">
        <Search v-if="isSearch" ></Search>
      </teleport>
</template>

<script setup>
import { inject, ref,onMounted, provide } from "vue";
import Search from "./Search.vue";
// import { getFriends,searchFriend,addFriend } from "@/api/friends";
const friendsList=ref([])
let isSearch = ref(false)
const userId=Number(localStorage.getItem('userId'))
console.log(userId);
const userInfo = inject('userInfo') 


onMounted(() => {
  // getFriendsList(userId)
});

// const getFriendsList=async (userId)=>{
//   console.log(userId);
//   try{
//     const res = await getFriends(userId)
//     if(!res.data.status){
//       friendsList.value=[]
//       const friendsData=res.data.data
//       friendsData.forEach(item=>{
//         friendsList.value.push({
//           id:item.id,
//           name:item.username,
//           imgUrl:item.imgSrc|| null,
//         })
//       })
    
//     }

//   }catch(error){
//     console.error(error)
//   }
  
// }
// provide('getFriendsList',getFriendsList)

//待补充，邀请进入游戏
const invToGame=(id)=>{
  
  console.log(id);
}

</script>

<style lang="scss" scoped>
.friend {
  position: absolute;
  color: var(--text-primary);
  top: 80px;
  right: 100px;
  width: 280px;
  height: 600px;
  background: rgba(17, 17, 17, 0.7);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  transition: all 0.3s ease;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      linear-gradient(
        120deg,
        rgba(79, 70, 229, 0.05) 0%,
        rgba(79, 70, 229, 0.02) 50%,
        transparent 100%
      );
    pointer-events: none;
    z-index: 0;
  }

  .my {
    height: 90px;
    width: 100%;
    display: flex;
    align-items: center;
    position: relative;
    padding: 0 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(8px);

    .my-info {
      height: 50px;
      display: flex;
      font-size: 18px;
      gap: 12px;
      align-items: center;
      
      span {
        font-weight: 500;
        background: linear-gradient(90deg, #fff, #a8b2d1);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .search-btn {
      width: 40px;
      height: 40px;
      background: rgba(79, 70, 229, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      right: 24px;
      border-radius: 12px;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: rgba(255, 255, 255, 0.8);

      &:hover {
        background: rgba(79, 70, 229, 0.25);
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
        color: white;
      }

      &:active {
        transform: translateY(0) scale(0.95);
      }
    }
  }

  .firend-list {
    width: 100%;
    height: calc(100% - 90px);
    overflow-y: auto;
    padding: 8px 0;
    position: relative;
    z-index: 1;

    .list-items {
      width: 100%;
      height: 75px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      padding: 0 24px;
      margin: 4px 0;

      &:hover {
        background: rgba(79, 70, 229, 0.15);
        backdrop-filter: blur(4px);
        transform: translateX(8px);

        .inv-btn {
          opacity: 1;
          transform: translateX(0);
        }
      }

      span {
        font-weight: 500;
        color: rgba(255, 255, 255, 0.9);
      }

      .items-avatar {
        transition: transform 0.3s ease;
        
        &:hover {
          transform: scale(1.1);
        }
      }

      .inv-btn {
        position: absolute;
        right: 24px;
        width: 38px;
        height: 38px;
        background: rgba(79, 70, 229, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0;
        transform: translateX(10px);
        color: rgba(255, 255, 255, 0.8);

        &:hover {
          background: rgba(79, 70, 229, 0.3);
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
          color: white;
        }

        &:active {
          transform: translateY(0) scale(0.95);
        }
      }
    }
  }
}

/* 优化滚动条样式 */
.firend-list::-webkit-scrollbar {
  width: 4px;
}

.firend-list::-webkit-scrollbar-track {
  background: transparent;
}

.firend-list::-webkit-scrollbar-thumb {
  background: rgba(79, 70, 229, 0.3);
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(79, 70, 229, 0.5);
    width: 6px;
  }
}

/* 添加列表项进入动画 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.list-items {
  animation: slideIn 0.3s ease-out forwards;
}
</style>

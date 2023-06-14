import Vue from 'vue';
<script>
import { ElMessage } from "element-plus";

export default {
  data() {
    return {
      info: {
        "<ip>:<port>": {
          video: {
            "<vid_0>": {
              type: "<description>",
            },
            "<vid_1>": {
              type: "<description>",
            },
          },
        },
      },
      selected: null,
      submit_jobs: [],
      inputText: null,
      uploadSuccess: false,
      sendUrl: "",
      isSubmit: false,

      servicesList: ["face_detection", "face_alignment"],
      currService: null,

      selectedIp: null,
      selectedVideoId: null,
      pipeline: [],
      delayCons: null,
      accCons: null
    };
  },
  methods: {
    selectItem(item) {
      console.log(item);

      this.selected = item.key;
      const ip = item.key.split("-")[0];
      const videoId = item.key.split("-")[1];

      this.selectedIp = ip;
      this.selectedVideoId = videoId;

      this.inputText = `{
    "node_addr": "${ip}",
    "video_id": ${videoId},
    "pipeline": ["face_detection", "face_alignment"],
    "user_constraint": {
      "delay": 0.3,
      "accuracy": 0.9
    }
}`;

      this.sendUrl = "/dag/query/submit_query";

      // console.log(this.sendUrl)
    },
    errHandler(err) {
      console.error(error);
      sessionStorage.clear();
      // Update submit_jobs array
      this.submit_jobs = [];
      // Update sessionStorage
      sessionStorage.setItem(
        "submit_jobs",
        JSON.stringify(this.submit_jobs)
      );
    },
    getInfo() {
      // 获取各节点视频流信息
      fetch("/dag/node/get_video_info")
        .then((response) => response.json())
        .then((data) => {
          console.log(data)
          this.info = data;
        })
        .catch((error) => {
          errHandler(error);
        });
      
      // 获取计算服务信息
      fetch("/serv/get_service_list").then((resp) => resp.json()).then((data) => {
        this.servicesList = data
      }).catch((err) => {
        errHandler(err);
      })
    },

    append2Pipeline(servName) {
      console.log(servName);
      this.pipeline.push(servName);
    },

    submitText() {
      // 根据变量构造请求
      // this.inputText = `{
      //   "node_addr": "${this.selectedIp}",
      //   "video_id": ${this.selectedVideoId},
      //   "pipeline": ${this.pipeline},
      //   "user_constraint": {
      //     "delay": ${this.delayCons},
      //     "accuracy": ${this.accCons}
      //   }
      // }`;
      this.inputText = {
        "node_addr": this.selectedIp,
        "video_id": parseInt(this.selectedVideoId),
        "pipeline": this.pipeline,
        "user_constraint": {
          "delay": parseFloat(this.delayCons),
          "accuracy": parseFloat(this.accCons)
        }
      };

      // let text = this.inputText.replace(/[\r\n\s]/g, ""); // remove all newlines and spaces
      let text = JSON.stringify(this.inputText)

      // console.log(JSON.stringify(text))
      console.log(text)

      fetch(this.sendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: text,
      })
        .then((response) => response.json())
        .then((data) => {
          // console.log(data.query_id);
          if (data.query_id === "GLOBAL_ID_1") {
            sessionStorage.clear();

            this.submit_jobs = [];
            sessionStorage.setItem(
              "submit_jobs",
              JSON.stringify(this.submit_jobs)
            );
          }

          // 将 submit_jobs 存储在 sessionStorage 中
          this.submit_jobs.push(data.query_id);
          console.log(this.submit_jobs);
          sessionStorage.setItem(
            "submit_jobs",
            JSON.stringify(this.submit_jobs)
          ); 

          // 设置交互信息
          this.uploadSuccess = true;
          this.isSubmit = true;
          ElMessage({
            message: "上传成功",
            showClose: true,
            type: "success",
            duration: 3000,
          });
        })
        .catch((error) => {
          console.error(error);
          ElMessage.error("上传失败");
        });
      // console.log(this.inputText)
      // console.log(JSON.stringify(text) )
    },
  },

  mounted() {
    const submitJobs = sessionStorage.getItem("submit_jobs");
    if (submitJobs) {
      this.submit_jobs = JSON.parse(submitJobs);
    }
    this.getInfo();
    // setInterval(() => {
    //     this.getInfo();
    // }, 200000);
  },
  // created() {
  //     // 在组件创建时，创建一个新的Vue实例
  //     this.eventBus = new Vue();
  // }
};
</script>

<template>
  <!-- <div> -->
  <!-- <div style="display: flex; flex-direction: column; align-items: center;"> -->
  <div class="available-node-header" style="width: 45%; margin-left: 30px">
    选择视频流
  </div>

  <div
    style="display: flex; margin-left: 30px; overflow: scroll; height: 500px"
  >
    <div style="width: 45%; height: 90%; overflow: scroll">
      <div v-for="(value, node_addr) in info" :node_addr="node_addr">
        <div
          class="available-node"
          v-for="(v, video_id) in value"
          v-on:click="selectItem({ key: node_addr + '-' + video_id })"
        >
          <ul
            style="list-style-type: none"
            v-bind:class="{ selected: selected === node_addr + '-' + video_id }"
          >
            <li class="subli">Addr: {{ node_addr }}</li>
            <li class="subli">VideoID: {{ video_id }}</li>
            <li class="subli">Description: {{ v.type }}</li>
          </ul>
        </div>
        <!-- <el-radio-group v-model="selected" @change="selectItem({key: selected})">
                            <li v-for="(v,k) in value.video">
                                <el-radio style="--el-radio-font-size:16px" :label="key + '-' + k">{{key}}--video{{ k }}:  {{ v.type }}</el-radio><br/>
                            </li>
                        </el-radio-group> -->
      </div>
    </div>

    <div style="width: 5%"></div>

    <div style="width: 45%">
      <!-- <el-input v-model="inputText" type="textarea" :rows="20" :cols="30"></el-input> -->

      <div>
        <div>
          已选视频流：节点“{{ selectedIp }}”的摄像头{{ selectedVideoId }}
        </div>
        <div>
          已选查询流：{{ pipeline }}
          <div>
            <el-radio v-for="(servName, idx) in servicesList" v-model="currService" :label="servName" @change.native="append2Pipeline(servName)">
              {{ servName }}
            </el-radio>
          </div>
        </div>
        <div style="display: flex; height: min-content; white-space: nowrap; padding: 10px;">
          时延约束（秒）：<el-input v-model="delayCons"></el-input>
          精度约束（F1-Score∈[0,1]）：<el-input v-model="accCons"></el-input>
        </div>
      </div>

      <div>
        <div style="display: inline-block; text-align: right; margin-top: 20px; margin-right: 20px;">
          <el-button type="primary" plain @click="submitText">Submit</el-button>
        </div>
      </div>


    </div>
  </div>
  <!-- </div> -->
</template>

<style>
::-webkit-scrollbar {
  display: none;
}
.available-node-header {
  text-align: center;
  font-weight: 1000;
  line-height: 40px;
  border: 2px solid grey;
  margin: 5px;
  border-radius: 10px;
}
.available-node {
  height: 80px;
  border: 2px dashed grey;
  margin: 5px;
  border-radius: 10px;
}
ul {
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
  margin-left: 10px;
  overflow-y: scroll;
}
.subli {
  margin: 0px;
  height: 20px;
  padding: 0px;
}
.selected {
  color: #409eff;
}
</style>



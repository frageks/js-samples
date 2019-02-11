<template>
  <div>
    <div class="result-table" ref="hot"></div>
    <div v-if="data.length>0">
      <div class="btns-exls">
        <div class="btn-group-manip-data">
          <button class="btn btn-default" @click.prevent="cancelSend">Cancel</button>
          <button class="btn btn-success" @click.prevent="send">OK</button>
        </div>
      </div>
    </div>
    <input type="file" accept=".xlsx" id="upload-excel" ref="upload-excel" @change="upload">
    <div class="error-text" v-for="error in errors" :key="error.text"><span v-if="error.value">{{ error.text }}</span></div>
  </div>
</template>

<script>
import readXlsxFile from 'read-excel-file';
import Handsontable from 'handsontable';

export default {
  name: 'UploadXlsx',
  data () {
    return {
      data: [],
      hot: null,
      errors: {
        size: {
          value: false,
          text: 'This file is too big.'
        },
        type: {
          value: false,
          text: 'Wrong type. Must be ".xlsx".'
        },
        server: {
          value: false,
          text: ''
        }
      }
    };
  },
  computed: {
    additionalMenuItems () {
      return {
        // 'hsep1': '---------',
        mark_as: {
          key: 'mark_as',
          name: 'Mark As',
          submenu: {
            items: [
              {
                key: 'mark_as:title',
                name: 'Title',
                callback: this.mark
              },
              {
                key: 'mark_as:date',
                name: 'Date',
                callback: this.mark
              },
              {
                key: 'mark_as:fact',
                name: 'Fact',
                callback: this.mark
              },
              {
                key: 'mark_as:plan',
                name: 'Plan',
                callback: this.mark
              }
            ]
          }
        }
      };
    }
  },
  methods: {
    mark () {
      console.log(arguments);
    },
    upload () {
      this.errors.type.value = false;
      this.errors.size.value = false;
      this.errors.server.value = false;
      this.errors.server.text = '';
      const input = this.$refs['upload-excel'];
      const file = input.files[0];
      const requiredType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if (file.type === requiredType) {
        readXlsxFile(file).then(rows => {
          this.data = rows;
          this.initPlugin();
          this.$nextTick(this.addCustomItems);
        });
      } else {
        console.log('error');
        this.errors.type.value = true;
      }
    },
    addCustomItems () {
      const contextMenu = this.hot.getPlugin('ContextMenu');
      this.hot.updateSettings({
        contextMenu: {
          items: Object.assign(
            {},
            this.additionalMenuItems,
            contextMenu.itemsFactory.predefinedItems
          )
        }
      });
    },
    async send () {
      // const readyData = this.hot.getData();
      this.errors.server.value = false;
      this.errors.server.text = '';
      try {
        const input = this.$refs['upload-excel'];
        const file = input.files[0];
        const formData = new FormData();
        if (file) {
          formData.append('file', file);
        }
        let id = this.$store.state.Kpi.activeKpi;
        const response = await this.axios.put('/i-api/upload_kpi', formData, {params: {kpi_id: id}});
        this.$store.dispatch('Kpi/loadKpi');
      } catch (e) {
        // console.error(e);
        this.errors.server.value = true;
        this.errors.server.text = e.response.statusText;
      }
    },
    cancelSend () {
      this.hot.destroy();
      this.hot = null;
      this.data = [];
      this.$refs.hot.style.height = 0;
      const input = this.$refs['upload-excel'];
      input.value = '';
    },
    initPlugin () {
      const container = this.$refs.hot;
      const config = {
        data: this.data,
        rowHeaders: true,
        colHeaders: true,
        contextMenu: true,
        width: 800,
        height: 500,
        className: 'htCenter'
      };
      this.hot = null;
      this.hot = new Handsontable(container, config);
    }
  }
};
</script>

<style src="~/handsontable/dist/handsontable.full.css"></style>
<style scoped>
  .result-table {
    color: #333;
    font-family: Arial;
    margin: 30px;
    display: block;
    font-size: 12px;
  }
  .btn-group-manip-data {
    float: right;
    margin: 10px;
  }
  .btns-exls {
    margin: 30px;
  }
  .error-text {
    color: red;
  }

  table {
    width: 100%;
    margin: 0;
  }
  .table-panel {
    height: 39px;
    margin-top: 5px;
    padding-bottom: 10px;
  }
</style>

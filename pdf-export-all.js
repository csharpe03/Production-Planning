import 'jspdf-autotable';
import _ from 'lodash';

export default {
  createPdfParams() {
    const pdfParams = {
      navigation: null,
      departmentPlans: [],
    };
    return pdfParams;
  },
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  async exportMultipleBuilderPdf(params) {
    const nav = params.navigation;
    if (!nav) {
      console.error(`Missing parameter 'navigation' in params for exportOneBuilderPdf(params)`);
      return;
    }
    console.log(`Creating PDF from: ${JSON.stringify(params)}`);

    for (let d = 0; d < params.departments.length; ++d) {
      const department = params.departments[d];
      console.log(`exporting department: ${JSON.stringify(d)}`);
      // nav.departmentId = department.departmentId;
      // nav.departmentCode = department.departmentCode;

      await this.sleep(1000);
    }
  },
};

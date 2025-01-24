"use strict";
const commerce-sdk = require("commerce-sdk");
import User from "users/models/users.model";
import Demo from "demos/models/demo.model";
import Campaign from 'models/campaigns.model';
import { CAMPAIGN_ADDED, CAMPAIGN_DELETED, CAMPAIGN_RUN, CAMPAIGN_UPDATED, DUPLICATE_CAMPAIGN, SYSTEM_ERROR } from "campaign.messages";
// import { sendCampaign } from "common/campaign-emailer";
import { welcome } from "common/email-updated";

const Utils = require("utils/common");

async function updateCampaign(req, res) {
  const { body } = req;
  try {
    let updated = await Campaign.findOneAndUpdate(
      { _id: Utils.toObjectId(body._id) },
      {
        $set: body,
      }
    );

    res.send({ message: CAMPAIGN_UPDATED });
  } catch (e) {
    res
      .status(e.status || 403)
      .send({ message: e.message || SYSTEM_ERROR });
  }
}

async function addNewCampaign(req, res) {
  const { body } = req;
  try {

    let data = await new Campaign(body).save().catch((error) => {
      throw error;
    });

    res.send({ message: CAMPAIGN_ADDED });
  } catch (e) {
    res
      .status(e.status || 403)
      .send({ message: e.message || SYSTEM_ERROR });
  }
}

async function getSavedCampaigns(req, res) {
  const { query } = req;
  try {

    let data = await Campaign.find({});

    data = data.map((e) => {
      if (typeof e == 'object')
        e = e.toObject();
      const count = e.demos.length;
      e.count = count;
      e.demos = undefined;
      return e;
    });
    res.send({ data });
  } catch (e) {
    res
      .status(e.status || 403)
      .send({ message: e.message || SYSTEM_ERROR });
  }
}


async function runCampaign(req, res) {
  const { body } = req;
  try {

    let data = await Campaign.findOne({ _id: Utils.toObjectId(body._id) });

    data.demos.map((demo) => {
      const { name, email } = demo;
      if (body.template == 'email-template') {
        welcome.welcomeMF({ name, email });
      } else {
        welcome.welcome({ name, email });
      }
      // sendCampaign({ name, email, template: body.template }, 'demo');
    });

    await Campaign.findOneAndUpdate(
      { _id: Utils.toObjectId(body._id) },
      {
        $set: {
          status: 'completed',
          is_active: false
        },
      }
    );

    res.send({ message: CAMPAIGN_RUN });
  } catch (e) {
    console.log(e)
    res
      .status(e.status || 403)
      .send({ message: e.message || SYSTEM_ERROR });
  }
}

async function deleteCampaign(req, res) {
  const { params, user } = req;
  try {
    let _deleted = await Campaign.findOneAndUpdate(
      { _id: Utils.toObjectId(params._id) },
      {
        $set: {
          is_deleted: true,
        },
      }
    );

    res.send({ message: CAMPAIGN_DELETED });
  } catch (e) {
    res
      .status(e.status || 403)
      .send({ message: e.message || SYSTEM_ERROR });
  }
}

module.exports = {
  updateCampaign: updateCampaign,
  addNewCampaign: addNewCampaign,
  getSavedCampaigns: getSavedCampaigns,
  deleteCampaign: deleteCampaign,
  runCampaign: runCampaign
};

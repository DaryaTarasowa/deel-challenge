exports.getUnpaidJobsForUser = async (req, res) => {
  const { Job } = req.app.get('models');
  const profileId = req.profile.get('id');
  const jobs = await Job.getUnpaidForUser(profileId);
  return res.status(200).send({ jobs });
};

exports.payJobWithValidation = async (req, res) => {
  const { Job } = req.app.get('models');
  const { jobId } = req.params;
  const jobToPay = await Job.findByPk(jobId);

  try {
    const { job, clientBalance, contractorBalance } = await req.profile.pay(jobToPay);
    return res.status(200).send({
      job, clientBalance, contractorBalance,
    });
  } catch (e) {
    return res.status(400).send({ message: e.message });
  }
};

exports.getContract = async (req, res) => {
  const { Contract } = req.app.get('models');
  const { id } = req.params;
  const contract = await Contract.findByPk(id);
  if (!contract) {
    res.status(404).send({ message: `No Contract found with id ${id}` });
  }
  const permitted = await contract.isUserPermitted(req.profile.get('id'));
  return permitted ? res.send({ contract }) : res.status(403).end();
};

exports.getActiveContracts = async (req, res) => {
  const { Contract } = req.app.get('models');
  const profileId = req.profile.get('id');
  const contracts = await Contract.getAllForUser(profileId);
  return res.send({ contracts });
};

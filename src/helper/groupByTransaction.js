const groupByTransaction = (res, key) => {
  return res.reduce((hash, obj) => {
    if (obj[key] === undefined) return hash;
    return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) });
  }, {});
};
module.exports = { groupByTransaction };

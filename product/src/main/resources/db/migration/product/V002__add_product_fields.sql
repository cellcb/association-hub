-- Add new fields to prd_product table
ALTER TABLE prd_product ADD COLUMN model VARCHAR(100);
ALTER TABLE prd_product ADD COLUMN price VARCHAR(100);
ALTER TABLE prd_product ADD COLUMN summary TEXT;
ALTER TABLE prd_product ADD COLUMN featured BOOLEAN DEFAULT FALSE;
ALTER TABLE prd_product ADD COLUMN contact VARCHAR(100);
ALTER TABLE prd_product ADD COLUMN website VARCHAR(255);

-- Add comments
COMMENT ON COLUMN prd_product.model IS '产品型号';
COMMENT ON COLUMN prd_product.price IS '产品价格';
COMMENT ON COLUMN prd_product.summary IS '产品摘要';
COMMENT ON COLUMN prd_product.featured IS '是否推荐';
COMMENT ON COLUMN prd_product.contact IS '联系人';
COMMENT ON COLUMN prd_product.website IS '官方网站';

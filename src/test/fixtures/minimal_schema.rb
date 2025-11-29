# Minimal schema for basic tests
ActiveRecord::Schema[7.0].define(version: 2023_11_20_000001) do
  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end
end

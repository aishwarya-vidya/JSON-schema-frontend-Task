import React from "react";
import { Form, Input, Button, Select, Card, Tabs, Space } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useForm, useFieldArray, Controller } from "react-hook-form";

const { TabPane } = Tabs;

type FieldType = "string" | "number" | "nested";
type Field = {
  key: string;
  type: FieldType;
  fields?: Field[]; // For nested
};

type JsonSchemaForm = {
  fields: Field[];
};

const typeOptions = [
  { label: "String", value: "string" },
  { label: "Number", value: "number" },
  { label: "Nested", value: "nested" },
];

function buildSchema(fields: Field[]): any {
  const schema: any = { type: "object", properties: {} };
  fields.forEach((field) => {
    if (field.type === "string" || field.type === "number") {
      schema.properties[field.key || ""] = { type: field.type };
    } else if (field.type === "nested") {
      schema.properties[field.key || ""] = buildSchema(field.fields || []);
    }
  });
  return schema;
}

const FieldEditor: React.FC<{
  nestIndex?: number[];
  control: any;
  register: any;
  getValues: any;
  setValue: any;
  remove: (index: number) => void;
  append: (value: any) => void;
  fields: any[];
}> = ({ nestIndex = [], control, register, getValues, setValue, remove, append, fields }) => (
  <Space direction="vertical" style={{ width: "100%" }}>
    {fields.map((item, idx) => {
      const fieldPath = [...nestIndex, idx];
      const fieldName = `fields${fieldPath.map(i => `[${i}]`).join("")}`;
      const type = getValues(`${fieldName}.type`);
      return (
        <Card
          key={item.id}
          size="small"
          style={{ marginBottom: 8, background: "#fafafa" }}
          bodyStyle={{ padding: 12 }}
        >
          <Space>
            <Controller
              name={`${fieldName}.key`}
              control={control}
              defaultValue={item.key}
              render={({ field }) => (
                <Input {...field} placeholder="Field Name" style={{ width: 130 }} />
              )}
            />
            <Controller
              name={`${fieldName}.type`}
              control={control}
              defaultValue={item.type}
              render={({ field }) => (
                <Select {...field} options={typeOptions} style={{ width: 100 }} />
              )}
            />
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(idx)} />
          </Space>
          {type === "nested" && (
            <NestedFields
              nestIndex={[...fieldPath, "fields"]}
              control={control}
              register={register}
              getValues={getValues}
              setValue={setValue}
              parentFieldName={`${fieldName}.fields`}
            />
          )}
        </Card>
      );
    })}

    <Button
      icon={<PlusOutlined />}
      onClick={() => append({ key: "", type: "string", fields: [] })}
    >
      Add Field
    </Button>
  </Space>
);

const NestedFields: React.FC<{
  nestIndex: (string | number)[];
  control: any;
  register: any;
  getValues: any;
  setValue: any;
  parentFieldName: string;
}> = ({ nestIndex, control, register, getValues, setValue, parentFieldName }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: parentFieldName,
  });
  return (
    <div style={{ marginLeft: 24, marginTop: 4, borderLeft: "2px solid #eee", paddingLeft: 12 }}>
      <FieldEditor
        nestIndex={nestIndex as number[]}
        control={control}
        register={register}
        getValues={getValues}
        setValue={setValue}
        remove={remove}
        append={append}
        fields={fields}
      />
    </div>
  );
};

const JsonSchemaBuilder: React.FC = () => {
  const { control, handleSubmit, getValues, setValue, register, watch } = useForm<JsonSchemaForm>({
    defaultValues: { fields: [] },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  });

  const watchedFields = watch("fields");

  return (
    <Card style={{ maxWidth: 650, margin: "2rem auto", boxShadow: "0 4px 12px #eee" }}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Builder" key="1">
          <FieldEditor
            control={control}
            register={register}
            getValues={getValues}
            setValue={setValue}
            remove={remove}
            append={append}
            fields={fields}
          />
        </TabPane>
        <TabPane tab="JSON" key="2">
          <pre style={{ background: "#f6f8fa", padding: 12, borderRadius: 4 }}>
            {JSON.stringify(buildSchema(watchedFields || []), null, 2)}
          </pre>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default JsonSchemaBuilder;
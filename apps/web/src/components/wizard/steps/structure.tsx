import { useState } from "react";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// Temporary simple replacements to avoid React 18 compatibility issues
const DragDropContext = ({ children, onDragEnd }: { children: any; onDragEnd: any }) => <div>{children}</div>;
const Droppable = ({ children, droppableId }: { children: (provided: any, snapshot: any) => any; droppableId: string }) => <div>{children({ droppableProps: {}, innerRef: () => {} }, {})}</div>;  
const Draggable = ({ children, draggableId, index }: { children: (provided: any, snapshot: any) => any; draggableId: string; index: number }) => <div>{children({ innerRef: () => {}, draggableProps: {}, dragHandleProps: {} }, {})}</div>;
import { Type, Image, MousePointer, Minus, Plus, Move, Eye } from "lucide-react";

interface StructureStepProps {
  data: {
    blocks: Array<{
      id: string;
      type: "header" | "text" | "image" | "button" | "divider";
      content: any;
    }>;
    storyArc: {
      problem: boolean;
      proof: boolean;
      cta: boolean;
    };
  };
  onUpdate: (data: any) => void;
  wizardData: any;
}

const BLOCK_TYPES = [
  {
    type: "header",
    label: "Header",
    icon: Type,
    description: "Title or headline",
    color: "blue",
  },
  {
    type: "text",
    label: "Text Block",
    icon: Type,
    description: "Paragraph content",
    color: "gray",
  },
  {
    type: "image",
    label: "Image",
    icon: Image,
    description: "Visual content",
    color: "green",
  },
  {
    type: "button",
    label: "Button",
    icon: MousePointer,
    description: "Call to action",
    color: "purple",
  },
  {
    type: "divider",
    label: "Divider",
    icon: Minus,
    description: "Section separator",
    color: "orange",
  },
];

export function StructureStep({ data, onUpdate, wizardData }: StructureStepProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const addBlock = (type: string) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type: type as any,
      content: getDefaultContent(type),
    };
    
    onUpdate({
      blocks: [...data.blocks, newBlock],
    });
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case "header":
        return { text: "Your Headline Here", fontSize: "32px", color: "#000000" };
      case "text":
        return { text: "Your content goes here...", fontSize: "16px", color: "#333333" };
      case "image":
        return { src: "", alt: "Image description", width: "100%" };
      case "button":
        return { text: "Click Here", url: "", style: "primary" };
      case "divider":
        return { height: "2px", color: "#e5e5e5" };
      default:
        return {};
    }
  };

  const removeBlock = (blockId: string) => {
    onUpdate({
      blocks: data.blocks.filter(block => block.id !== blockId),
    });
  };

  const updateBlock = (blockId: string, content: any) => {
    onUpdate({
      blocks: data.blocks.map(block =>
        block.id === blockId ? { ...block, content: { ...block.content, ...content } } : block
      ),
    });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(data.blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onUpdate({ blocks: items });
  };

  const updateStoryArc = (element: string, value: boolean) => {
    onUpdate({
      storyArc: {
        ...data.storyArc,
        [element]: value,
      },
    });
  };

  const storyArcScore = Object.values(data.storyArc).filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Build your email structure
        </h1>
        <p className="text-lg text-gray-600">
          Drag and drop blocks to create your email layout with a compelling story arc.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Block Palette */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Blocks</h2>
          <div className="space-y-2">
            {BLOCK_TYPES.map((blockType) => {
              const Icon = blockType.icon;
              return (
                <button
                  key={blockType.type}
                  onClick={() => addBlock(blockType.type)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <Icon className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{blockType.label}</div>
                    <div className="text-xs text-gray-500">{blockType.description}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Story Arc Meter */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Story Arc</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.storyArc.problem}
                  onChange={(e) => updateStoryArc("problem", e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Problem/Hook</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.storyArc.proof}
                  onChange={(e) => updateStoryArc("proof", e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Proof/Solution</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.storyArc.cta}
                  onChange={(e) => updateStoryArc("cta", e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Call to Action</span>
              </label>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-600 mb-1">
                Story Score: {storyArcScore}/3
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    storyArcScore === 3 ? "bg-green-500" : 
                    storyArcScore >= 2 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${(storyArcScore / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Email Builder */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Email Layout</h2>
            <button className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg min-h-96">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="email-blocks">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="p-4 space-y-3"
                  >
                    {data.blocks.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Type className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Drag blocks here to start building your email</p>
                      </div>
                    ) : (
                      data.blocks.map((block, index) => (
                        <Draggable key={block.id} draggableId={block.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`border rounded-lg p-4 bg-white hover:shadow-md transition-shadow ${
                                selectedBlock === block.id ? "ring-2 ring-blue-500" : "border-gray-200"
                              }`}
                              onClick={() => setSelectedBlock(block.id)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div
                                  {...provided.dragHandleProps}
                                  className="flex items-center space-x-2 text-gray-600"
                                >
                                  <Move className="w-4 h-4" />
                                  <span className="text-sm font-medium capitalize">
                                    {block.type}
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeBlock(block.id);
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <span className="text-sm">Remove</span>
                                </button>
                              </div>
                              
                              {/* Block Content Renderer */}
                              <div className="border border-gray-100 rounded p-3 bg-gray-50">
                                {block.type === "header" && (
                                  <h2 className="text-xl font-bold">{block.content.text}</h2>
                                )}
                                {block.type === "text" && (
                                  <p className="text-gray-700">{block.content.text}</p>
                                )}
                                {block.type === "image" && (
                                  <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                                    <Image className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                                {block.type === "button" && (
                                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg">
                                    {block.content.text}
                                  </button>
                                )}
                                {block.type === "divider" && (
                                  <hr className="border-gray-300" />
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        {/* Block Editor */}
        <div className="lg:col-span-1">
          {selectedBlock ? (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Block</h2>
              {/* Block editing form would go here */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Select a block to edit its properties
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Properties</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Select a block to edit its properties
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
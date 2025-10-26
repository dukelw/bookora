import Slider from "./Slider";

export default interface Collection {
  _id?: string;
  name: string;
  isActive?: boolean;
  sliders?: Slider[];
}
